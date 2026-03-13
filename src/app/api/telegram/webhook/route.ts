import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
const ALLOWED_CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";
const USER_ID = process.env.TELEGRAM_USER_ID || "";

// ─── TELEGRAM REPLY ─────────────────────────────────
async function reply(chatId: number | string, text: string) {
  await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text, parse_mode: "HTML" }),
  });
}

// ─── GET TODAY'S PROJECT ─────────────────────────────
async function getTodayProject(userId: string) {
  const db = getSupabaseAdmin();
  const dayOfWeek = new Date().getDay(); // 0=Sun, 6=Sat
  const { data } = await db
    .from("daily_assignments")
    .select("project_id")
    .eq("user_id", userId)
    .eq("day_of_week", dayOfWeek);

  if (!data || data.length === 0) return null;

  const { data: project } = await db
    .from("user_projects")
    .select("id, name, emoji")
    .eq("id", data[0].project_id)
    .eq("user_id", userId)
    .single();

  return project;
}

// ─── FIND PROJECT BY NAME ────────────────────────────
async function findProject(userId: string, name: string) {
  const db = getSupabaseAdmin();
  const { data: projects } = await db
    .from("user_projects")
    .select("id, name, emoji")
    .eq("user_id", userId)
    .eq("status", "active");

  if (!projects) return null;

  const lower = name.toLowerCase().trim();
  return (
    projects.find((p) => p.name.toLowerCase() === lower) ||
    projects.find((p) => p.name.toLowerCase().includes(lower)) ||
    null
  );
}

// ─── COMMAND: /task ──────────────────────────────────
async function handleTask(chatId: number, args: string) {
  if (!args.trim()) {
    await reply(chatId, "Uso: /task [Proyecto]: descripcion de la tarea");
    return;
  }

  let projectName: string | null = null;
  let taskText: string;

  const colonIdx = args.indexOf(":");
  if (colonIdx > 0) {
    projectName = args.slice(0, colonIdx).trim();
    taskText = args.slice(colonIdx + 1).trim();
  } else {
    taskText = args.trim();
  }

  if (!taskText) {
    await reply(chatId, "Falta la descripcion de la tarea.");
    return;
  }

  let project;
  if (projectName) {
    project = await findProject(USER_ID, projectName);
    if (!project) {
      await reply(chatId, `No encontre el proyecto "${projectName}". Usa /projects para ver la lista.`);
      return;
    }
  } else {
    project = await getTodayProject(USER_ID);
    if (!project) {
      await reply(chatId, "No hay proyecto asignado para hoy. Usa /task NombreProyecto: tarea");
      return;
    }
  }

  const db = getSupabaseAdmin();
  const { error } = await db.from("tasks").insert({
    user_id: USER_ID,
    project_id: project.id,
    text: taskText,
    done: false,
    priority: "medium",
  });

  if (error) {
    await reply(chatId, "Error al agregar la tarea. Intenta de nuevo.");
    return;
  }

  await reply(chatId, `Tarea agregada a ${project.emoji} ${project.name}: ${taskText}`);
}

// ─── COMMAND: /bulk ──────────────────────────────────
async function handleBulk(chatId: number, args: string) {
  const lines = args.split("\n").map((l) => l.trim()).filter(Boolean);
  if (lines.length === 0) {
    await reply(chatId, "Uso: /bulk Proyecto\n- tarea 1\n- tarea 2\n- tarea 3");
    return;
  }

  // First line = project name, rest = tasks
  const projectName = lines[0].replace(/^[-•*]\s*/, "").trim();
  const taskLines = lines.slice(1)
    .map((l) => l.replace(/^[-•*]\s*/, "").trim())
    .filter(Boolean);

  if (taskLines.length === 0) {
    await reply(chatId, "Agrega tareas despues del nombre del proyecto:\n/bulk Jantile\n- tarea 1\n- tarea 2");
    return;
  }

  const project = await findProject(USER_ID, projectName);
  if (!project) {
    await reply(chatId, `No encontre el proyecto "${projectName}". Usa /projects para ver la lista.`);
    return;
  }

  const db = getSupabaseAdmin();
  const rows = taskLines.map((text) => ({
    user_id: USER_ID,
    project_id: project.id,
    text,
    done: false,
    priority: "medium" as const,
  }));

  const { error } = await db.from("tasks").insert(rows);

  if (error) {
    await reply(chatId, "Error al agregar las tareas. Intenta de nuevo.");
    return;
  }

  const list = taskLines.map((t, i) => `  ${i + 1}. ${t}`).join("\n");
  await reply(chatId, `${taskLines.length} tareas agregadas a ${project.emoji} ${project.name}:\n${list}`);
}

// ─── COMMAND: /tasks ─────────────────────────────────
async function handleTasks(chatId: number) {
  const project = await getTodayProject(USER_ID);
  if (!project) {
    await reply(chatId, "No hay proyecto asignado para hoy.");
    return;
  }

  const db = getSupabaseAdmin();
  const { data: tasks } = await db
    .from("tasks")
    .select("id, text, done")
    .eq("user_id", USER_ID)
    .eq("project_id", project.id)
    .eq("done", false)
    .order("created_at", { ascending: true });

  if (!tasks || tasks.length === 0) {
    await reply(chatId, `No hay tareas pendientes para ${project.emoji} ${project.name}.`);
    return;
  }

  const list = tasks.map((t, i) => `  ${i + 1}. ${t.text}`).join("\n");
  await reply(chatId, `Tareas pendientes — ${project.emoji} ${project.name}:\n${list}`);
}

// ─── COMMAND: /done ──────────────────────────────────
async function handleDone(chatId: number, args: string) {
  const num = parseInt(args.trim(), 10);
  if (isNaN(num) || num < 1) {
    await reply(chatId, "Uso: /done [numero]. Usa /tasks para ver la lista numerada.");
    return;
  }

  const project = await getTodayProject(USER_ID);
  if (!project) {
    await reply(chatId, "No hay proyecto asignado para hoy.");
    return;
  }

  const db = getSupabaseAdmin();
  const { data: tasks } = await db
    .from("tasks")
    .select("id, text")
    .eq("user_id", USER_ID)
    .eq("project_id", project.id)
    .eq("done", false)
    .order("created_at", { ascending: true });

  if (!tasks || tasks.length === 0) {
    await reply(chatId, "No hay tareas pendientes.");
    return;
  }

  if (num > tasks.length) {
    await reply(chatId, `Solo hay ${tasks.length} tarea(s) pendiente(s). Usa /tasks para ver la lista.`);
    return;
  }

  const task = tasks[num - 1];
  const { error } = await db
    .from("tasks")
    .update({ done: true })
    .eq("id", task.id)
    .eq("user_id", USER_ID);

  if (error) {
    await reply(chatId, "Error al completar la tarea. Intenta de nuevo.");
    return;
  }

  await reply(chatId, `Completada: ${task.text}`);
}

// ─── COMMAND: /projects ──────────────────────────────
async function handleProjects(chatId: number) {
  const db = getSupabaseAdmin();
  const { data: projects } = await db
    .from("user_projects")
    .select("name, emoji, status")
    .eq("user_id", USER_ID)
    .eq("status", "active")
    .order("created_at", { ascending: true });

  if (!projects || projects.length === 0) {
    await reply(chatId, "No tienes proyectos activos.");
    return;
  }

  const list = projects.map((p) => `  ${p.emoji} ${p.name}`).join("\n");
  await reply(chatId, `Proyectos activos:\n${list}`);
}

// ─── WEBHOOK HANDLER ─────────────────────────────────
export async function POST(request: Request) {
  try {
    const body = await request.json();
    const message = body?.message;
    if (!message?.text || !message?.chat?.id) {
      return NextResponse.json({ ok: true });
    }

    const chatId = message.chat.id;

    // Security: only allow configured chat
    if (String(chatId) !== ALLOWED_CHAT_ID) {
      return NextResponse.json({ ok: true });
    }

    if (!USER_ID) {
      await reply(chatId, "Bot no configurado. Falta TELEGRAM_USER_ID en las variables de entorno.");
      return NextResponse.json({ ok: true });
    }

    const text = message.text.trim();
    const [command, ...rest] = text.split(" ");
    const args = rest.join(" ");

    switch (command.toLowerCase()) {
      case "/task":
        await handleTask(chatId, args);
        break;
      case "/tasks":
        await handleTasks(chatId);
        break;
      case "/done":
        await handleDone(chatId, args);
        break;
      case "/projects":
        await handleProjects(chatId);
        break;
      case "/bulk":
        await handleBulk(chatId, args);
        break;
      case "/start":
        await reply(
          chatId,
          "FocusStack Bot activo.\n\nComandos:\n/task [Proyecto]: tarea\n/bulk Proyecto + lista\n/tasks — ver pendientes\n/done [#] — completar tarea\n/projects — ver proyectos"
        );
        break;
      default:
        await reply(chatId, "Comando no reconocido. Usa /task, /tasks, /done, o /projects.");
    }
  } catch (e) {
    console.error("Telegram webhook error:", e);
  }

  return NextResponse.json({ ok: true });
}
