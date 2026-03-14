import { NextResponse } from "next/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const maxDuration = 30;

const BOT_TOKEN = process.env.TELEGRAM_BOT_TOKEN || process.env.NEXT_PUBLIC_TELEGRAM_BOT_TOKEN || "";
const ALLOWED_CHAT_ID = process.env.TELEGRAM_ALLOWED_CHAT_ID || process.env.NEXT_PUBLIC_TELEGRAM_CHAT_ID || "";
const USER_ID = process.env.TELEGRAM_USER_ID || "";

// ─── TELEGRAM REPLY ─────────────────────────────────
const MAX_MSG = 4000; // Telegram limit is 4096, leave margin

async function sendOne(chatId: number | string, text: string) {
  const res = await fetch(`https://api.telegram.org/bot${BOT_TOKEN}/sendMessage`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ chat_id: chatId, text }),
  });
  if (!res.ok) {
    console.error(`Telegram send error: ${res.status} ${await res.text()}`);
  }
}

async function reply(chatId: number | string, text: string) {
  if (text.length <= MAX_MSG) {
    await sendOne(chatId, text);
    return;
  }
  // Split by lines, send in chunks
  const lines = text.split("\n");
  let chunk = "";
  for (const line of lines) {
    if (chunk.length + line.length + 1 > MAX_MSG) {
      await sendOne(chatId, chunk);
      chunk = line;
    } else {
      chunk += (chunk ? "\n" : "") + line;
    }
  }
  if (chunk) await sendOne(chatId, chunk);
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

// ─── GITHUB: FETCH RECENT COMMITS ────────────────────
async function fetchRecentCommits(repo: string): Promise<{ message: string; date: string }[]> {
  const token = process.env.GITHUB_TOKEN || "";
  const since = new Date(Date.now() - 48 * 60 * 60 * 1000).toISOString(); // last 48h

  const headers: Record<string, string> = {
    Accept: "application/vnd.github+json",
    "User-Agent": "FocusStack-Bot",
  };
  if (token) headers.Authorization = `Bearer ${token}`;

  try {
    const controller = new AbortController();
    const timeout = setTimeout(() => controller.abort(), 8000); // 8s timeout

    const res = await fetch(
      `https://api.github.com/repos/${repo}/commits?since=${since}&per_page=50`,
      { headers, signal: controller.signal }
    );
    clearTimeout(timeout);

    if (!res.ok) {
      console.error(`GitHub API error for ${repo}: ${res.status}`);
      return [];
    }

    const data = await res.json();
    return (data as { commit: { message: string; author: { date: string } } }[]).map((c) => ({
      message: c.commit.message.split("\n")[0], // first line only
      date: c.commit.author.date,
    }));
  } catch (e) {
    console.error(`GitHub fetch failed for ${repo}:`, e);
    return [];
  }
}

// ─── BILINGUAL SYNONYMS ─────────────────────────────
const SYNONYMS: Record<string, string[]> = {
  add: ["agregar", "crear", "create", "new", "nuevo", "añadir"],
  fix: ["arreglar", "corregir", "repair", "bug", "hotfix", "patch"],
  update: ["actualizar", "modificar", "change", "edit", "editar", "cambiar"],
  delete: ["eliminar", "borrar", "remove", "quitar", "drop"],
  setup: ["configurar", "config", "configure", "instalar", "install", "init"],
  auth: ["login", "autenticacion", "autenticación", "authentication", "signin", "signup", "registro"],
  page: ["pagina", "página", "vista", "view", "screen", "pantalla"],
  test: ["prueba", "testing", "verificar", "verify", "check"],
  deploy: ["desplegar", "deployment", "publicar", "publish", "release"],
  style: ["estilo", "css", "tailwind", "diseño", "design", "theme", "tema"],
  crud: ["create", "read", "update", "delete", "agregar", "eliminar", "editar"],
  modal: ["dialog", "popup", "dialogo", "diálogo"],
  list: ["lista", "tabla", "table", "grid"],
  button: ["boton", "botón", "btn", "click"],
  search: ["buscar", "busqueda", "búsqueda", "filter", "filtrar", "filtro"],
  send: ["enviar", "submit", "mandar"],
  save: ["guardar", "store", "persist", "persistir"],
  load: ["cargar", "fetch", "obtener", "get"],
  show: ["mostrar", "display", "render", "visualizar"],
  hide: ["ocultar", "toggle"],
  image: ["imagen", "foto", "photo", "picture", "img"],
  cost: ["costo", "precio", "price", "estimate", "estimacion", "estimación"],
  drawing: ["dibujo", "plano", "plan", "blueprint"],
  project: ["proyecto"],
  sync: ["sincronizar", "sincronización", "synchronize"],
  offline: ["desconectado", "sin conexion", "sin conexión"],
  notification: ["notificacion", "notificación", "alerta", "alert"],
  export: ["exportar", "download", "descargar"],
  import: ["importar", "upload", "subir"],
  billing: ["facturacion", "facturación", "payment", "pago", "stripe", "checkout"],
  webhook: ["hook", "callback", "endpoint"],
  middleware: ["gate", "guard", "proteger"],
  scaffold: ["boilerplate", "template", "plantilla", "skeleton"],
  refactor: ["refactorizar", "restructure", "reestructurar", "cleanup", "limpiar"],
};

// Build reverse lookup: word → all its synonyms
const SYNONYM_MAP = new Map<string, Set<string>>();
for (const [, group] of Object.entries(SYNONYMS)) {
  const allWords = [...group, ...Object.keys(SYNONYMS).filter((k) => SYNONYMS[k] === group || group === SYNONYMS[k])];
  // Add the key itself
  for (const entry of Object.entries(SYNONYMS)) {
    if (entry[1] === group) allWords.push(entry[0]);
  }
  const unique = [...new Set(allWords)];
  for (const w of unique) {
    if (!SYNONYM_MAP.has(w)) SYNONYM_MAP.set(w, new Set());
    for (const s of unique) SYNONYM_MAP.get(w)!.add(s);
  }
}
// Simpler: just build from SYNONYMS directly
function getSynonyms(word: string): string[] {
  for (const [key, group] of Object.entries(SYNONYMS)) {
    const all = [key, ...group];
    if (all.includes(word)) return all;
  }
  return [word];
}

const STOP_WORDS = new Set([
  "the", "and", "for", "with", "that", "this", "from", "have", "has", "was", "are",
  "been", "will", "can", "not", "but", "all", "por", "para", "con", "que", "los",
  "las", "del", "una", "unos", "unas", "como", "mas", "más", "cada", "sin", "cuando",
  "donde", "hay", "ser", "estar", "tener", "hacer", "poder", "deber", "usar",
]);

// ─── MATCH COMMITS TO TASKS ──────────────────────────
function matchCommitToTask(commitMsg: string, taskText: string): boolean {
  const commitLower = commitMsg.toLowerCase();
  const taskLower = taskText.toLowerCase();

  // Extract significant words: 3+ chars, not stop words, not common prefixes
  const taskWords = taskLower
    .replace(/[^\w\sáéíóúñü]/g, " ")
    .split(/\s+/)
    .filter((w) => w.length >= 3 && !STOP_WORDS.has(w));
  if (taskWords.length === 0) return false;

  // Strip conventional commit prefix from commit: "feat: xxx" → "xxx"
  const commitClean = commitLower.replace(/^(feat|fix|chore|docs|style|refactor|test|ci|build|perf)(\(.+?\))?:\s*/, "");

  // Count matches — a word matches if it OR any synonym appears in the commit
  const matchCount = taskWords.filter((w) => {
    if (commitClean.includes(w)) return true;
    const syns = getSynonyms(w);
    return syns.some((s) => commitClean.includes(s));
  }).length;

  const matchRatio = matchCount / taskWords.length;

  // Match if 40%+ of task words found (lowered from 50% for bilingual flexibility)
  return matchRatio >= 0.4;
}

// ─── REVIEW ONE PROJECT ─────────────────────────────
async function reviewProject(db: ReturnType<typeof getSupabaseAdmin>, project: { id: string; name: string; emoji: string }, repo: string) {
  const commits = await fetchRecentCommits(repo);

  const { data: tasks } = await db
    .from("tasks")
    .select("id, text")
    .eq("user_id", USER_ID)
    .eq("project_id", project.id)
    .eq("done", false)
    .order("created_at", { ascending: true });

  const matched: { taskId: string; taskText: string; commitMsg: string }[] = [];
  const unmatched: string[] = [];

  if (tasks && tasks.length > 0) {
    for (const task of tasks) {
      const match = commits.find((c) => matchCommitToTask(c.message, task.text));
      if (match) {
        matched.push({ taskId: task.id, taskText: task.text, commitMsg: match.message });
      } else {
        unmatched.push(task.text);
      }
    }

    if (matched.length > 0) {
      const ids = matched.map((m) => m.taskId);
      await db.from("tasks").update({ done: true }).in("id", ids).eq("user_id", USER_ID);
    }
  }

  return { project, repo, commits: commits.length, tasks: tasks?.length || 0, matched, unmatched };
}

// ─── COMMAND: /review ────────────────────────────────
async function handleReview(chatId: number, args: string) {
  const db = getSupabaseAdmin();
  const arg = args.trim().toLowerCase();

  // /review all — review all projects with repos
  if (arg === "all" || arg === "todos") {
    const { data: projects } = await db
      .from("user_projects")
      .select("id, name, emoji, github_repo")
      .eq("user_id", USER_ID)
      .eq("status", "active")
      .not("github_repo", "is", null);

    if (!projects || projects.length === 0) {
      await reply(chatId, "No hay proyectos con repo de GitHub configurado.");
      return;
    }

    await reply(chatId, `Revisando ${projects.length} proyectos...`);

    // Fetch all projects in parallel
    const results = await Promise.all(
      projects.map((p) => reviewProject(db, p, p.github_repo!))
    );

    let totalMatched = 0;
    let totalPending = 0;
    let fullReport = "REVIEW ALL — Reporte completo\n";

    for (const result of results) {
      totalMatched += result.matched.length;
      totalPending += result.unmatched.length;

      fullReport += `\n${result.project.emoji} ${result.project.name} (${result.commits} commits)\n`;

      if (result.matched.length > 0) {
        fullReport += result.matched.map((m) => `  ✓ ${m.taskText}`).join("\n") + "\n";
      }
      if (result.unmatched.length > 0) {
        fullReport += result.unmatched.map((t) => `  · ${t}`).join("\n") + "\n";
      }
      if (result.tasks === 0 && result.commits === 0) {
        fullReport += "  Sin actividad\n";
      } else if (result.tasks === 0) {
        fullReport += "  Sin tareas pendientes\n";
      }
    }

    fullReport += `\nResumen: ${totalMatched} completadas | ${totalPending} pendientes`;
    await reply(chatId, fullReport);
    return;
  }

  // Single project review
  let project;
  if (args.trim()) {
    project = await findProject(USER_ID, args.trim());
    if (!project) {
      await reply(chatId, `No encontre el proyecto "${args.trim()}". Usa /projects para ver la lista.`);
      return;
    }
  } else {
    project = await getTodayProject(USER_ID);
    if (!project) {
      await reply(chatId, "No hay proyecto asignado para hoy. Usa /review all para revisar todos.");
      return;
    }
  }

  const { data: projectData } = await db
    .from("user_projects")
    .select("github_repo")
    .eq("id", project.id)
    .single();

  const repo = projectData?.github_repo;
  if (!repo) {
    await reply(chatId, `${project.emoji} ${project.name} no tiene repo de GitHub configurado. Editalo en la app para agregar el repo.`);
    return;
  }

  await reply(chatId, `Revisando ${project.emoji} ${project.name} (${repo})...`);

  const result = await reviewProject(db, project, repo);

  let report = `REVIEW — ${project.emoji} ${project.name}\n${result.commits} commits (48h) | ${result.tasks} tareas\n`;

  if (result.matched.length > 0) {
    report += `\nCompletadas automaticamente (${result.matched.length}):\n`;
    report += result.matched.map((m) => `  ${m.taskText}\n    ← ${m.commitMsg}`).join("\n");
  }

  if (result.unmatched.length > 0) {
    report += `\n\nPendientes (${result.unmatched.length}):\n`;
    report += result.unmatched.map((t, i) => `  ${i + 1}. ${t}`).join("\n");
  }

  if (result.matched.length === 0 && result.tasks > 0) {
    report += "\nNo se encontraron matches entre commits y tareas.";
  }

  await reply(chatId, report);
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
      case "/review":
        await handleReview(chatId, args);
        break;
      case "/start":
        await reply(
          chatId,
          "FocusStack Bot activo.\n\nComandos:\n/task [Proyecto]: tarea\n/bulk Proyecto + lista\n/tasks — ver pendientes\n/done [#] — completar tarea\n/review [Proyecto] — auto-check GitHub\n/review all — revisar todos los proyectos\n/projects — ver proyectos"
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
