
/* ==========================================================================
   INTEGRAÇÃO DO MÓDULO DE PESQUISAS AMS
   Cadastro, edição, detalhes, exclusão, associações e visão geral.
   Armazenamento demonstrativo utilizando localStorage.
   ========================================================================== */

(() => {
    "use strict";

    // ==========================================
    // CONFIGURAÇÕES
    // ==========================================

    const STORAGE_KEY = "ams_pesquisas";
    const DELETION_REQUESTS_KEY = "ams_solicitacoes_exclusao";

    const OVERVIEW_PAGE = "pesquisa-visao-geral.html";
    const FORM_PAGE = "pesquisa-cadastro.html";
    const DETAILS_PAGE = "pesquisa-detalhes.html";
    const EDIT_PAGE = "pesquisa-editar.html";

    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = [".pdf", ".holo", ".png"];

    // ==========================================
    // ARMAZENAMENTO
    // ==========================================

    function readAll() {
        try {
            const data = JSON.parse(
                localStorage.getItem(STORAGE_KEY) || "[]"
            );

            return Array.isArray(data) ? data : [];
        } catch (error) {
            console.error("Erro ao ler pesquisas:", error);
            return [];
        }
    }

    function writeAll(items) {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error("Erro ao salvar pesquisas:", error);

            alert(
                "Não foi possível salvar os dados. " +
                "O armazenamento do navegador pode estar cheio."
            );

            return false;
        }
    }

    function escapeHTML(value) {
        return String(value ?? "").replace(/[&<>"']/g, char => ({
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        })[char]);
    }

    // ==========================================
    // STATUS
    // ==========================================

    function normalizeStatus(value) {
        const text = String(value || "")
            .trim()
            .toLowerCase();

        const map = {
            progresso: "Em progresso",
            "em progresso": "Em progresso",
            "em andamento": "Em progresso",

            pausada: "Pausada",

            concluida: "Concluída",
            "concluída": "Concluída",

            inconclusiva: "Inconclusiva",

            abortada: "Abortada",
            abordada: "Abortada"
        };

        return map[text] || value || "Em progresso";
    }

    function statusClass(status) {
        return {
            "Em progresso": "progress",
            "Pausada": "paused",
            "Concluída": "completed",
            "Inconclusiva": "inconclusive",
            "Abortada": "aborted"
        }[normalizeStatus(status)] || "progress";
    }

    // ==========================================
    // NAVEGAÇÃO
    // ==========================================

    function overviewUrl() {
        return new URL(OVERVIEW_PAGE, window.location.href).href;
    }

    function formUrl() {
        return new URL(FORM_PAGE, window.location.href).href;
    }

    function detailsUrl(id) {
        const url = new URL(DETAILS_PAGE, window.location.href);
        url.searchParams.set("id", id);
        return url.href;
    }

    function editUrl(id) {
        const url = new URL(EDIT_PAGE, window.location.href);
        url.searchParams.set("id", id);
        return url.href;
    }

    function connectNavigation() {
        const path = window.location.pathname.toLowerCase();

        const isForm =
            path.endsWith(FORM_PAGE) ||
            Boolean(document.querySelector(".form-grid:not([data-edit-form])"));

        const isEdit =
            path.endsWith(EDIT_PAGE) ||
            Boolean(document.querySelector("[data-edit-form]"));

        const newButton = document.querySelector(".btn-primary");

        if (!isForm && !isEdit && newButton) {
            newButton.addEventListener("click", event => {
                if (!newButton.closest("form")) {
                    event.preventDefault();
                    window.location.href = formUrl();
                }
            });
        }

        const cancelButton = document.querySelector(
            ".btn-cancel:not([data-action='cancel-edit'])"
        );

        if (cancelButton) {
            cancelButton.addEventListener("click", () => {
                window.location.href = overviewUrl();
            });
        }
    }

    // ==========================================
    // GERAÇÃO AUTOMÁTICA DO CÓDIGO
    // ==========================================

    function nextId(existingRows = []) {
        const stored = readAll();

        const ids = [
            ...stored.map(item => item.id),
            ...existingRows.map(row => row.id)
        ];

        const highest = ids.reduce((max, id) => {
            const number = Number(
                String(id || "").match(/(\d+)$/)?.[1] || 0
            );

            return Math.max(max, number);
        }, 6);

        return `PESQ-${String(highest + 1).padStart(3, "0")}`;
    }

    // ==========================================
    // DATAS
    // ==========================================

    function dateForInput(value) {
        if (!value) return "";

        const text = String(value).trim();

        // Já está no formato YYYY-MM-DD.
        if (/^\d{4}-\d{2}-\d{2}$/.test(text)) {
            return text;
        }

        // Formato DD/MM/YYYY.
        const brDate = text.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

        if (brDate) {
            return `${brDate[3]}-${brDate[2]}-${brDate[1]}`;
        }

        return text;
    }

    // ==========================================
    // ARQUIVOS
    // ==========================================

    function formatFileSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileExtension(filename) {
        const index = filename.lastIndexOf(".");
        return index >= 0
            ? filename.slice(index).toLowerCase()
            : "";
    }

    function createFileElement(file) {
        const item = document.createElement("div");
        item.className = "file-item";

        const icon = document.createElement("i");
        icon.setAttribute("data-lucide", "file-text");
        icon.className = "text-cyan";

        const name = document.createElement("span");
        name.className = "file-name mono";
        name.textContent = file.nome;

        const size = document.createElement("span");
        size.className = "file-size mono";
        size.textContent = file.tamanho || "";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-btn";
        removeButton.setAttribute(
            "aria-label",
            `Remover arquivo ${file.nome}`
        );
        removeButton.textContent = "×";

        item.append(icon, name, size, removeButton);

        return item;
    }

    function setupFiles() {
        const dropzone = document.querySelector(".dropzone");
        const fileList = document.querySelector(".file-list");

        // A edição também possui uma lista de arquivos,
        // mesmo sem possuir uma área de arrastar arquivos.
        if (fileList) {
            fileList.addEventListener("click", event => {
                const button = event.target.closest(".remove-btn");

                if (button) {
                    button.closest(".file-item")?.remove();
                }
            });
        }

        if (!dropzone || !fileList) return;

        let fileInput = dropzone.querySelector(
            "input[type='file']"
        );

        if (!fileInput) {
            fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".pdf,.holo,.png";
            fileInput.multiple = true;
            fileInput.hidden = true;
            fileInput.className = "file-input";

            dropzone.appendChild(fileInput);
        }

        function processFiles(files) {
            [...files].forEach(file => {
                const extension = getFileExtension(file.name);

                if (!ALLOWED_EXTENSIONS.includes(extension)) {
                    alert(`Formato não permitido: ${file.name}`);
                    return;
                }

                if (file.size > MAX_FILE_SIZE) {
                    alert(
                        `O arquivo ${file.name} ultrapassa o limite de 25 MB.`
                    );
                    return;
                }

                const alreadyExists = [
                    ...fileList.querySelectorAll(".file-name")
                ].some(element =>
                    element.textContent.toLowerCase() ===
                    file.name.toLowerCase()
                );

                if (alreadyExists) {
                    alert(`O arquivo ${file.name} já está na lista.`);
                    return;
                }

                fileList.appendChild(createFileElement({
                    nome: file.name,
                    tamanho: formatFileSize(file.size)
                }));
            });

            fileInput.value = "";
        }

        dropzone.addEventListener("click", event => {
            if (
                event.target === fileInput ||
                event.target.closest("button")
            ) {
                return;
            }

            fileInput.click();
        });

        dropzone.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInput.click();
            }
        });

        fileInput.addEventListener("change", () => {
            processFiles(fileInput.files);
        });

        dropzone.addEventListener("dragover", event => {
            event.preventDefault();
            dropzone.classList.add("drag-over");
        });

        dropzone.addEventListener("dragleave", () => {
            dropzone.classList.remove("drag-over");
        });

        dropzone.addEventListener("drop", event => {
            event.preventDefault();
            dropzone.classList.remove("drag-over");

            if (event.dataTransfer?.files) {
                processFiles(event.dataTransfer.files);
            }
        });
    }

    function collectFiles(root = document) {
        return [
            ...root.querySelectorAll(".file-list .file-item")
        ].map(item => {
            const nome = item.querySelector(".file-name")
                ?.textContent.trim() || "";

            return {
                nome,
                tamanho: item.querySelector(".file-size")
                    ?.textContent.trim() || "",
                tipo: getFileExtension(nome)
            };
        }).filter(file => file.nome);
    }

    // ==========================================
    // ASSOCIAÇÕES: MISSÕES E HUMANOS
    // UTILIZADAS NO CADASTRO
    // ==========================================

    function createMissionChip(name) {
        const chip = document.createElement("span");
        chip.className = "mission-chip";

        const dot = document.createElement("span");
        dot.className = "dot-status cyan";

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.setAttribute(
            "aria-label",
            `Remover ${name}`
        );
        removeButton.textContent = "×";

        chip.append(
            dot,
            document.createTextNode(` ${name} `),
            removeButton
        );

        return chip;
    }

    function createMonitoredItem(name, id) {
        const item = document.createElement("div");
        item.className = "monitored-item";

        const avatar = document.createElement("span");
        avatar.className = "monitored-avatar";
        avatar.textContent = "Ψ";

        const info = document.createElement("div");
        info.className = "monitored-info";

        const strong = document.createElement("strong");
        strong.textContent = name;

        const idSpan = document.createElement("span");
        idSpan.className = "mono";
        idSpan.textContent = id;

        const removeButton = document.createElement("button");
        removeButton.type = "button";
        removeButton.className = "remove-btn";
        removeButton.setAttribute(
            "aria-label",
            `Remover ${name}`
        );
        removeButton.textContent = "×";

        info.append(strong, idSpan);
        item.append(avatar, info, removeButton);

        return item;
    }

    function setupAssociations() {
        const form = document.querySelector(
            ".form-grid:not([data-edit-form])"
        );

        if (form) {
            const missionBlock = form.querySelector(".chips-row");
            const monitoredList = form.querySelector(".monitored-list");

            if (missionBlock) {
                missionBlock.addEventListener("click", event => {
                    const button = event.target.closest("button");

                    if (button) {
                        button.closest(".mission-chip")?.remove();
                    }
                });

                const missionButton = missionBlock
                    .closest(".assoc-block")
                    ?.querySelector(".link-action");

                missionButton?.addEventListener("click", () => {
                    const mission = prompt(
                        "Informe o nome ou número da missão:"
                    );

                    if (!mission || !mission.trim()) return;

                    const name = mission.trim();

                    const exists = [
                        ...missionBlock.querySelectorAll(".mission-chip")
                    ].some(chip => {
                        const clone = chip.cloneNode(true);
                        clone.querySelector("button")?.remove();

                        return clone.textContent.trim().toLowerCase() ===
                            name.toLowerCase();
                    });

                    if (exists) {
                        alert("Essa missão já está vinculada.");
                        return;
                    }

                    missionBlock.appendChild(
                        createMissionChip(name)
                    );
                });
            }

            if (monitoredList) {
                monitoredList.addEventListener("click", event => {
                    const button = event.target.closest(".remove-btn");

                    if (button) {
                        button.closest(".monitored-item")?.remove();
                    }
                });

                const humanButton = monitoredList
                    .closest(".assoc-block")
                    ?.querySelector(".link-action");

                humanButton?.addEventListener("click", () => {
                    const name = prompt(
                        "Informe o nome do humano monitorado:"
                    );

                    if (!name || !name.trim()) return;

                    const id = prompt("Informe o ID do humano:");

                    if (!id || !id.trim()) return;

                    const cleanName = name.trim();
                    const cleanId = id.trim();

                    const exists = [
                        ...monitoredList.querySelectorAll(".monitored-item")
                    ].some(item =>
                        item.querySelector(".monitored-info .mono")
                            ?.textContent.trim().toLowerCase() ===
                        cleanId.toLowerCase()
                    );

                    if (exists) {
                        alert("Esse ID já está vinculado.");
                        return;
                    }

                    monitoredList.appendChild(
                        createMonitoredItem(cleanName, cleanId)
                    );
                });
            }
        }

        // Associações da tela de edição:
        // auxiliares e amostras.
        const editForm = document.querySelector("[data-edit-form]");

        if (!editForm) return;

        const auxiliaryBlock = editForm.querySelector(
            "[data-edit-auxiliares]"
        );

        const sampleList = editForm.querySelector(
            "[data-edit-amostras]"
        );

        if (auxiliaryBlock) {
            auxiliaryBlock.addEventListener("click", event => {
                const button = event.target.closest("button");

                if (button) {
                    button.closest(".mission-chip")?.remove();
                }
            });

            const addButton = auxiliaryBlock
                .closest(".assoc-block")
                ?.querySelector(".link-action");

            addButton?.addEventListener("click", () => {
                const name = prompt(
                    "Informe o nome do cientista auxiliar:"
                );

                if (!name || !name.trim()) return;

                const cleanName = name.trim();

                const exists = [
                    ...auxiliaryBlock.querySelectorAll(".mission-chip")
                ].some(chip => {
                    const clone = chip.cloneNode(true);
                    clone.querySelector("button")?.remove();

                    return clone.textContent.trim().toLowerCase() ===
                        cleanName.toLowerCase();
                });

                if (exists) {
                    alert("Esse auxiliar já está vinculado.");
                    return;
                }

                auxiliaryBlock.appendChild(
                    createMissionChip(cleanName)
                );
            });
        }

        if (sampleList) {
            sampleList.addEventListener("click", event => {
                const button = event.target.closest(".remove-btn");

                if (button) {
                    button.closest(".monitored-item")?.remove();
                }
            });

            const addButton = sampleList
                .closest(".assoc-block")
                ?.querySelector(".link-action");

            addButton?.addEventListener("click", () => {
                const name = prompt("Informe o nome da amostra:");

                if (!name || !name.trim()) return;

                const id = prompt("Informe o código da amostra:");

                if (!id || !id.trim()) return;

                const cleanName = name.trim();
                const cleanId = id.trim();

                const exists = [
                    ...sampleList.querySelectorAll(".monitored-item")
                ].some(item =>
                    item.querySelector(".monitored-info .mono")
                        ?.textContent.trim().toLowerCase() ===
                    cleanId.toLowerCase()
                );

                if (exists) {
                    alert("Essa amostra já está vinculada.");
                    return;
                }

                sampleList.appendChild(
                    createMonitoredItem(cleanName, cleanId)
                );
            });
        }
    }

    function collectMissions(root = document) {
        return [
            ...root.querySelectorAll(".chips-row .mission-chip")
        ].map(chip => {
            const clone = chip.cloneNode(true);
            clone.querySelector("button")?.remove();

            return clone.textContent.trim();
        }).filter(Boolean);
    }

    function collectHumans(root = document) {
        return [
            ...root.querySelectorAll(".monitored-list .monitored-item")
        ].map(item => ({
            nome: item.querySelector(".monitored-info strong")
                ?.textContent.trim() || "",
            id: item.querySelector(".monitored-info .mono")
                ?.textContent.trim() || ""
        })).filter(item => item.nome && item.id);
    }

    function collectChips(root, selector) {
        const container = root.querySelector(selector);

        if (!container) return [];

        return [
            ...container.querySelectorAll(".mission-chip")
        ].map(chip => {
            const clone = chip.cloneNode(true);
            clone.querySelector("button")?.remove();

            return clone.textContent.trim();
        }).filter(Boolean);
    }

    function collectSamples(root) {
        const container = root.querySelector("[data-edit-amostras]");

        if (!container) return [];

        return [
            ...container.querySelectorAll(".monitored-item")
        ].map(item => ({
            nome: item.querySelector(".monitored-info strong")
                ?.textContent.trim() || "",
            id: item.querySelector(".monitored-info .mono")
                ?.textContent.trim() || ""
        })).filter(item => item.nome && item.id);
    }

    // ==========================================
    // CIENTISTAS AUXILIARES: CADASTRO
    // ==========================================

    function setupAssistants() {
        document.querySelectorAll(".assistant-card").forEach(card => {
            const checkbox = card.querySelector(
                'input[type="checkbox"]'
            );

            if (!checkbox) return;

            card.classList.toggle("checked", checkbox.checked);

            checkbox.addEventListener("change", () => {
                card.classList.toggle("checked", checkbox.checked);
            });
        });
    }

    function collectAssistants(root) {
        return [
            ...root.querySelectorAll(
                ".assistants-grid input[type='checkbox']:checked"
            )
        ].map(input =>
            input.closest(".assistant-card")
                ?.querySelector(".assistant-info strong")
                ?.textContent.trim()
        ).filter(Boolean);
    }

    // ==========================================
    // CADASTRO DE PESQUISAS
    // ==========================================

    function setupForm() {
        const form = document.querySelector(
            ".form-grid:not([data-edit-form])"
        );

        if (!form) return;

        const idField = form.querySelector("#id-pesquisa");

        if (idField) {
            idField.value = nextId();
        }

        form.querySelectorAll("input[id], select[id], textarea[id]")
            .forEach(field => {
                if (!field.name) {
                    field.name = field.id;
                }
            });

        function syncRadioStates() {
            form.querySelectorAll(".radio-option").forEach(option => {
                const input = option.querySelector(
                    'input[type="radio"]'
                );

                option.classList.toggle(
                    "active-progress",
                    Boolean(input?.checked)
                );
            });
        }

        syncRadioStates();

        form.querySelectorAll('input[name="estado"]').forEach(radio => {
            radio.addEventListener("change", syncRadioStates);
        });

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            const value = id =>
                form.querySelector(`#${id}`)?.value.trim() || "";

            const statusValue = form.querySelector(
                'input[name="estado"]:checked'
            )?.value || "progresso";

            const area = form.querySelector(
                "#area-cientifica option:checked"
            )?.textContent.trim() || "";

            const record = {
                id: value("id-pesquisa") || nextId(),

                nome: value("nome-pesquisa"),
                area,

                dataInicio: value("data-inicio"),
                objetivo: value("objetivo-central"),
                metodologia: value("descricao-metodologia"),
                cientista: value("cientista-responsavel"),

                auxiliares: collectAssistants(form),

                status: normalizeStatus(statusValue),

                missoes: collectMissions(form),
                humanosMonitorados: collectHumans(form),

                // Campos que também podem ser utilizados
                // pela tela de detalhes e pela edição.
                amostras: [],
                arquivos: collectFiles(form),

                criadoEm: new Date().toISOString()
            };

            const items = readAll();

            // Evita duplicação caso o código já exista.
            const alreadyExists = items.some(
                item => item.id === record.id
            );

            if (alreadyExists) {
                alert("Já existe uma pesquisa com esse código.");
                return;
            }

            items.push(record);

            if (!writeAll(items)) return;

            alert("Pesquisa cadastrada com sucesso!");

            window.location.href = overviewUrl();
        });
    }

    // ==========================================
    // REGISTROS INICIAIS DA VISÃO GERAL
    // ==========================================

    function getInitialOverviewRecords() {
        const tbody = document.querySelector(
            ".table-container tbody"
        );

        if (!tbody) return [];

        return [
            ...tbody.querySelectorAll("tr[data-research-id]")
        ].map(row => {
            const cells = row.querySelectorAll("td");

            if (cells.length < 5) return null;

            return {
                id: row.dataset.researchId,

                nome: cells[1].querySelector(".research-title")
                    ?.textContent.trim() || "",

                resumo: cells[1].querySelector(".research-sub")
                    ?.textContent.trim() || "",

                area: cells[2].textContent.trim(),

                cientista: cells[3].textContent.trim(),

                status: normalizeStatus(
                    cells[4].textContent.replace(/[•]/g, "").trim()
                )
            };
        }).filter(Boolean);
    }

    function getInitialDetailRecords() {
        return {
            "PESQ-001": {
                id: "PESQ-001",
                nome: "Análise de Resposta Neural...",
                area: "Neurologia Humana",
                cientista: "Cientista Etriz",
                status: "Em progresso",
                resumo: "Amostra: 14 Espécimes // Setor Beta-3 // Taxa de Adaptação: 68%"
            },

            "PESQ-002": {
                id: "PESQ-002",
                nome: "Mutação Genética Induzida por...",
                area: "Xenobiologia",
                cientista: "Cientista Alielaine",
                status: "Concluída",
                resumo: "Sequenciamento Genômico Cruzado // Telômeros Estabilizados"
            },

            "PESQ-003": {
                id: "PESQ-003",
                nome: "Comportamento Social sob...",
                area: "Comportamento Terrestre",
                cientista: "Cientista Etmorg",
                status: "Inconclusiva",
                resumo: "Câmara Hiperbárica 04 // Desvio Psicométrico Inesperado"
            },

            "PESQ-004": {
                id: "PESQ-004",
                nome: "Mapeamento Biocelular de...",
                area: "Bioquímica",
                cientista: "Cientista Etriz",
                status: "Em progresso",
                resumo: "Origem: Quadrante América do Sul // Proteínas Sintéticas Estáveis"
            },

            "PESQ-005": {
                id: "PESQ-005",
                nome: "Cinética de Regeneração...",
                area: "Bioquímica",
                cientista: "Cientista Alielaine",
                status: "Concluída",
                resumo: "Aceleração com Gel Dérmico Xenomorfo // Eficiência +340%"
            },

            "PESQ-006": {
                id: "PESQ-006",
                nome: "Ressonância Quântica em...",
                area: "Neurologia Humana",
                cientista: "Cientista Etmorg",
                status: "Abortada",
                resumo: "Interrupção por Risco de Colapso Mental // Veto do Comando Alpha"
            }
        };
    }

    // ==========================================
    // VISÃO GERAL
    // BUSCA, FILTROS, INDICADORES E PAGINAÇÃO
    // ==========================================

    function setupOverview() {
        const tbody = document.querySelector(
            ".table-container tbody"
        );

        if (!tbody) return;

        const ITEMS_PER_PAGE = 6;

        const staticRecords = getInitialOverviewRecords();
        const storedRecords = readAll();

        // Quando uma pesquisa inicial é editada, o registro salvo
        // substitui a versão estática, sem criar duplicação.
        const storedIds = new Set(
            storedRecords.map(item => String(item.id))
        );

        const records = [
            ...staticRecords.filter(
                item => !storedIds.has(String(item.id))
            ),

            ...storedRecords.map(item => ({
                ...item,
                resumo: item.objetivo || item.resumo || "Pesquisa cadastrada",
                status: normalizeStatus(item.status)
            }))
        ];

        const searchInput = document.querySelector(
            ".search-box input"
        );

        const filterContainer = document.querySelector(
            ".filter-pills"
        );

        const count = document.querySelector(".table-count");
        const pageInfo = document.querySelector(".page-info");
        const pagination = document.querySelector(".pagination");
        const pageControls = pagination?.querySelector(".page-controls");

        let activeFilter = "todos";
        let currentPage = 1;

        const filterNames = {
            todos: "Todas",
            "Em progresso": "Em Progresso",
            "Pausada": "Pausadas",
            "Concluída": "Concluídas",
            "Inconclusiva": "Inconclusivas",
            "Abortada": "Abortadas"
        };

        function getFilterFromLabel(label) {
            const text = String(label).toLowerCase();

            if (text.includes("pausad")) return "Pausada";
            if (text.includes("progresso") || text.includes("andamento")) {
                return "Em progresso";
            }
            if (text.includes("inconclus")) return "Inconclusiva";
            if (text.includes("conclu")) return "Concluída";
            if (text.includes("abort")) return "Abortada";

            return "todos";
        }

        // Cria um filtro de pausadas caso exista alguma pesquisa
        // com esse status.
        if (
            filterContainer &&
            records.some(item => normalizeStatus(item.status) === "Pausada") &&
            ![...filterContainer.querySelectorAll(".pill")]
                .some(pill => getFilterFromLabel(pill.textContent) === "Pausada")
        ) {
            const pill = document.createElement("button");
            pill.type = "button";
            pill.className = "pill";
            pill.textContent = "Pausadas";

            filterContainer.appendChild(pill);
        }

        const pills = filterContainer
            ? [...filterContainer.querySelectorAll(".pill")]
            : [];

        function getCountByStatus(status) {
            return records.filter(item =>
                status === "todos" ||
                normalizeStatus(item.status) === status
            ).length;
        }

        function updateCounters() {
            const counts = {
                total: getCountByStatus("todos"),
                progress: getCountByStatus("Em progresso"),
                completed: getCountByStatus("Concluída"),
                inconclusive: getCountByStatus("Inconclusiva"),
                aborted: getCountByStatus("Abortada")
            };

            const statusCounts = {
                todos: counts.total,
                "Em progresso": counts.progress,
                "Pausada": getCountByStatus("Pausada"),
                "Concluída": counts.completed,
                "Inconclusiva": counts.inconclusive,
                "Abortada": counts.aborted
            };

            pills.forEach(pill => {
                const status = getFilterFromLabel(pill.textContent);

                pill.textContent =
                    `${filterNames[status] || filterNames.todos} ` +
                    `(${statusCounts[status] ?? counts.total})`;

                pill.classList.toggle(
                    "active",
                    activeFilter === status
                );

                pill.setAttribute(
                    "aria-pressed",
                    String(activeFilter === status)
                );
            });

            Object.entries(counts).forEach(([key, amount]) => {
                const element = document.querySelector(
                    `.kpi-card.${key} .kpi-number`
                );

                if (element) {
                    element.textContent = String(amount).padStart(2, "0");
                }
            });
        }

        function getFilteredRecords() {
            const term = (searchInput?.value || "")
                .trim()
                .toLocaleLowerCase("pt-BR");

            return records.filter(item => {
                const searchableText = [
                    item.id,
                    item.nome,
                    item.area,
                    item.cientista
                ].join(" ").toLocaleLowerCase("pt-BR");

                const matchesSearch = searchableText.includes(term);

                const matchesStatus =
                    activeFilter === "todos" ||
                    normalizeStatus(item.status) === activeFilter;

                return matchesSearch && matchesStatus;
            });
        }

        function renderPagination(totalPages) {
            if (!pageControls) return;

            pageControls.innerHTML = "";

            function createButton(label, page, options = {}) {
                const button = document.createElement("button");

                button.type = "button";
                button.className = "page-btn";
                button.textContent = label;
                button.disabled = Boolean(options.disabled);

                if (options.active) {
                    button.classList.add("selected");
                    button.setAttribute("aria-current", "page");
                }

                button.addEventListener("click", () => {
                    if (
                        page < 1 ||
                        page > totalPages ||
                        page === currentPage
                    ) {
                        return;
                    }

                    currentPage = page;
                    render();
                });

                pageControls.appendChild(button);
            }

            createButton("‹", currentPage - 1, {
                disabled: currentPage === 1
            });

            for (let page = 1; page <= totalPages; page++) {
                createButton(String(page), page, {
                    active: page === currentPage
                });
            }

            createButton("›", currentPage + 1, {
                disabled: currentPage === totalPages
            });
        }

        function render() {
            const filtered = getFilteredRecords();

            const totalPages = Math.max(
                1,
                Math.ceil(filtered.length / ITEMS_PER_PAGE)
            );

            if (currentPage > totalPages) {
                currentPage = totalPages;
            }

            const startIndex = (currentPage - 1) * ITEMS_PER_PAGE;

            const pageRecords = filtered.slice(
                startIndex,
                startIndex + ITEMS_PER_PAGE
            );

            if (pageRecords.length === 0) {
                tbody.innerHTML = `
                    <tr>
                        <td colspan="5" class="empty-state">
                            Nenhuma pesquisa encontrada.
                        </td>
                    </tr>
                `;
            } else {
                tbody.innerHTML = pageRecords.map(item => {
                    const css = statusClass(item.status);

                    const name = escapeHTML(item.nome);

                    const shortName = name.length > 38
                        ? `${name.slice(0, 38)}...`
                        : name;

                    return `
                        <tr
                            class="research-row"
                            data-research-id="${escapeHTML(item.id)}"
                            tabindex="0"
                            role="link"
                            aria-label="Ver detalhes da pesquisa ${escapeHTML(item.id)}"
                        >
                            <td>
                                <span class="id-code mono">
                                    • ${escapeHTML(item.id)}
                                </span>
                            </td>

                            <td>
                                <div class="research-title">
                                    ${shortName}
                                </div>

                                <div class="research-sub">
                                    ${escapeHTML(item.resumo || "—")}
                                </div>
                            </td>

                            <td>
                                <span class="category-badge">
                                    ${escapeHTML(item.area || "—")}
                                </span>
                            </td>

                            <td>
                                <span class="scientist">
                                    ${escapeHTML(item.cientista || "—")}
                                </span>
                            </td>

                            <td>
                                <span class="status-pill ${css}">
                                    • ${escapeHTML(normalizeStatus(item.status))}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join("");
            }

            const first = filtered.length === 0
                ? 0
                : startIndex + 1;

            const last = Math.min(
                startIndex + ITEMS_PER_PAGE,
                filtered.length
            );

            if (count) {
                count.textContent =
                    `${filtered.length} REGISTROS`;
            }

            if (pageInfo) {
                pageInfo.textContent =
                    `Exibindo ${first}–${last} de ${filtered.length} pesquisas`;
            }

            updateCounters();
            renderPagination(totalPages);

            if (window.lucide) {
                window.lucide.createIcons();
            }
        }

        tbody.addEventListener("click", event => {
            const row = event.target.closest("tr[data-research-id]");

            if (row) {
                window.location.href = detailsUrl(row.dataset.researchId);
            }
        });

        tbody.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;

            const row = event.target.closest("tr[data-research-id]");

            if (!row) return;

            event.preventDefault();

            window.location.href = detailsUrl(row.dataset.researchId);
        });

        searchInput?.addEventListener("input", () => {
            currentPage = 1;
            render();
        });

        pills.forEach(pill => {
            pill.addEventListener("click", () => {
                activeFilter = getFilterFromLabel(pill.textContent);
                currentPage = 1;
                render();
            });
        });

        render();
    }

    // ==========================================
    // MODAL DE SOLICITAÇÃO DE EXCLUSÃO
    // ==========================================

    function setupDeletionModal(record) {
        const trigger = document.querySelector(
            '[data-action="delete"]'
        );

        const modal = document.getElementById(
            "modalSolicitarExclusao"
        );

        if (!trigger || !modal || !record) return;

        const form = modal.querySelector("#formSolicitarExclusao");
        const textarea = modal.querySelector("#motivoExclusao");

        const idLabel = modal.querySelector(
            '[data-field="id"]'
        );

        const scientistLabel = modal.querySelector(
            '[data-field="cientista"]'
        );

        const closeButtons = modal.querySelectorAll(
            "[data-modal-close]"
        );

        function openModal() {
            if (idLabel) {
                idLabel.textContent = `REGISTRO ${record.id}`;
            }

            if (scientistLabel) {
                scientistLabel.textContent =
                    record.cientista || "Cientista Responsável";
            }

            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");

            textarea?.focus();
        }

        function closeModal() {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");

            form?.reset();
        }

        trigger.addEventListener("click", openModal);

        closeButtons.forEach(button => {
            button.addEventListener("click", closeModal);
        });

        modal.addEventListener("click", event => {
            if (event.target === modal) {
                closeModal();
            }
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !modal.hidden) {
                closeModal();
            }
        });

        form?.addEventListener("submit", event => {
            event.preventDefault();

            const motivo = textarea?.value.trim();

            if (!motivo) {
                textarea?.focus();
                return;
            }

            let requests = [];

            try {
                requests = JSON.parse(
                    localStorage.getItem(DELETION_REQUESTS_KEY) || "[]"
                );

                if (!Array.isArray(requests)) {
                    requests = [];
                }
            } catch {
                requests = [];
            }

            requests.push({
                id: `SOL-${Date.now()}`,
                pesquisaId: record.id,
                pesquisaNome: record.nome,
                cientista: record.cientista || "Cientista Responsável",
                motivo,
                status: "Pendente de auditoria / CEO",
                solicitadoEm: new Date().toISOString()
            });

            try {
                localStorage.setItem(
                    DELETION_REQUESTS_KEY,
                    JSON.stringify(requests)
                );
            } catch (error) {
                console.error(
                    "Erro ao salvar solicitação de exclusão:",
                    error
                );

                alert(
                    "Não foi possível registrar a solicitação."
                );

                return;
            }

            alert(
                "Solicitação de exclusão registrada e encaminhada " +
                "para auditoria do CEO."
            );

            closeModal();
        });
    }

    // ==========================================
    // DETALHES DA PESQUISA
    // ==========================================

    function setupDetails() {
        const page = document.querySelector(
            "[data-research-details]"
        );

        if (!page) return;

        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("id");

        const stored = readAll().find(
            item => String(item.id) === String(id)
        );

        const initialRecords = getInitialDetailRecords();

        const record = stored || initialRecords[id];

        function setText(selector, value, fallback = "Não informado") {
            page.querySelectorAll(selector).forEach(element => {
                element.textContent =
                    value == null || value === ""
                        ? fallback
                        : value;
            });
        }

        function safe(value) {
            return escapeHTML(
                value == null || value === ""
                    ? "Não informado"
                    : value
            );
        }

        function listMarkup(items, formatter) {
            return items?.length
                ? items.map(formatter).join("")
                : '<li class="muted-item">Nenhum registro informado.</li>';
        }

        if (!record) {
            const content = page.querySelector(".details-content");

            if (content) {
                content.innerHTML = `
                    <section class="panel-card not-found">
                        <i data-lucide="file-question"></i>

                        <h2>Pesquisa não encontrada</h2>

                        <p>
                            Não foi possível localizar o registro solicitado.
                        </p>

                        <a class="action-link" href="${escapeHTML(OVERVIEW_PAGE)}">
                            Voltar para Pesquisas
                        </a>
                    </section>
                `;
            }

            if (window.lucide) {
                window.lucide.createIcons();
            }

            return;
        }

        document.title =
            `AMS - ${record.id} | Detalhes da Pesquisa`;

        setText("[data-field='id']", record.id);
        setText("[data-field='area']", record.area);
        setText("[data-field='nome']", record.nome);
        setText(
            "[data-field='status']",
            normalizeStatus(record.status)
        );
        setText("[data-field='cientista']", record.cientista);

        const creationDate = record.criadoEm || record.dataCriacao;

        setText(
            "[data-field='data-criacao']",
            creationDate
                ? new Date(creationDate).toLocaleString("pt-BR")
                : ""
        );

        setText("[data-field='data-inicio']", record.dataInicio);
        setText("[data-field='data-conclusao']", record.dataConclusao);

        setText(
            "[data-field='resumo']",
            record.resumo || record.objetivo
        );

        setText("[data-field='objetivo']", record.objetivo);
        setText("[data-field='metodologia']", record.metodologia);
        setText("[data-field='relatorio']", record.relatorio);
        setText("[data-field='historico']", record.historico);

        const totalSamples =
            record.amostras?.length ||
            record.humanosMonitorados?.length ||
            0;

        setText(
            "[data-field='total-amostras']",
            totalSamples ? String(totalSamples) : ""
        );

        const status = page.querySelector(".detail-status");

        if (status) {
            status.classList.remove(
                "progress",
                "paused",
                "completed",
                "inconclusive",
                "aborted"
            );

            status.classList.add(
                statusClass(record.status)
            );
        }

        const missions = page.querySelector(
            "[data-list='missoes']"
        );

        if (missions) {
            missions.innerHTML = listMarkup(
                record.missoes,
                item => `<li>${safe(item)}</li>`
            );
        }

        const humans = page.querySelector(
            "[data-list='humanos']"
        );

        if (humans) {
            humans.innerHTML = listMarkup(
                record.humanosMonitorados,
                item => `
                    <li>
                        <strong>${safe(item.nome)}</strong>
                        <span>${safe(item.id)}</span>
                    </li>
                `
            );
        }

        const assistants = page.querySelector(
            "[data-list='auxiliares']"
        );

        if (assistants) {
            assistants.innerHTML = listMarkup(
                record.auxiliares,
                item => `<li>${safe(item)}</li>`
            );
        }

        const files = page.querySelector(
            "[data-list='arquivos']"
        );

        if (files) {
            files.innerHTML = listMarkup(
                record.arquivos,
                item => `
                    <li>
                        <span>${safe(item.nome)}</span>
                        <small>${safe(item.tamanho)}</small>
                    </li>
                `
            );
        }

        const samples = page.querySelector(
            "[data-list='amostras']"
        );

        if (samples) {
            samples.innerHTML = listMarkup(
                record.amostras,
                item => `
                    <li>
                        ${safe(
                            typeof item === "string"
                                ? item
                                : item.nome || item.tipo
                        )}
                    </li>
                `
            );
        }

        const back = page.querySelector(
            "[data-action='back']"
        );

        if (back) {
            back.href = overviewUrl();
        }

        const edit = page.querySelector(
            "[data-action='edit']"
        );

        if (edit) {
            edit.href = editUrl(record.id);
        }

        setupDeletionModal(record);

        page.querySelectorAll("[data-tab]").forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.tab;

                page.querySelectorAll("[data-tab]").forEach(tab => {
                    const active = tab === button;

                    tab.classList.toggle("active", active);

                    tab.setAttribute(
                        "aria-selected",
                        String(active)
                    );
                });

                page.querySelectorAll("[data-panel]").forEach(panel => {
                    panel.hidden = panel.dataset.panel !== target;
                });
            });
        });

        if (window.lucide) {
            window.lucide.createIcons();
        }
    }

    // ==========================================
    // STATUS DA TELA DE EDIÇÃO
    // ==========================================

    function setupEditStatuses(form, currentStatus) {
        const normalized = normalizeStatus(currentStatus);

        const statusMap = {
            "Em andamento": "Em progresso",
            "Pausada": "Pausada",
            "Concluída": "Concluída",
            "Inconclusiva": "Inconclusiva",
            "Abortada": "Abortada"
        };

        const existingOptions = [
            ...form.querySelectorAll(".status-option")
        ];

        const parent = existingOptions[0]?.parentElement;

        // A edição também precisa permitir os mesmos status
        // disponíveis no cadastro.
        if (parent) {
            ["Inconclusiva", "Abortada"].forEach(status => {
                const exists = form.querySelector(
                    `input[name="estado"][value="${status}"]`
                );

                if (exists) return;

                const label = document.createElement("label");
                label.className = "status-option";

                const input = document.createElement("input");
                input.type = "radio";
                input.name = "estado";
                input.value = status;

                const text = document.createElement("span");
                text.textContent = status;

                label.append(input, text);
                parent.appendChild(label);
            });
        }

        const radio = [
            ...form.querySelectorAll('input[name="estado"]')
        ].find(input => {
            const value = input.value.trim();

            return normalizeStatus(value) === normalized ||
                statusMap[value] === normalized;
        });

        if (radio) {
            radio.checked = true;
        }

        function sync() {
            form.querySelectorAll(".status-option").forEach(option => {
                const input = option.querySelector(
                    'input[name="estado"]'
                );

                option.classList.toggle(
                    "active-progress",
                    Boolean(input?.checked)
                );
            });
        }

        sync();

        form.querySelectorAll('input[name="estado"]').forEach(input => {
            input.addEventListener("change", sync);
        });
    }

    // ==========================================
    // EDIÇÃO DE PESQUISAS
    // ==========================================

    function setupEditForm() {
        const form = document.querySelector(
            "[data-edit-form]"
        );

        if (!form) return;

        const params = new URLSearchParams(
            window.location.search
        );

        const id = params.get("id");

        const items = readAll();

        const existingIndex = items.findIndex(
            item => String(item.id) === String(id)
        );

        // Permite editar também as pesquisas iniciais da tabela.
        const initialRecord = getInitialDetailRecords()[id];

        const currentRecord = existingIndex >= 0
            ? items[existingIndex]
            : initialRecord
                ? {
                    ...initialRecord,
                    auxiliares: [],
                    missoes: [],
                    humanosMonitorados: [],
                    amostras: [],
                    arquivos: []
                }
                : null;

        const backDetailsLink = document.querySelector(
            '[data-action="back-details"]'
        );

        const cancelEditButton = document.querySelector(
            '[data-action="cancel-edit"]'
        );

        const targetDetailsUrl = id
            ? detailsUrl(id)
            : overviewUrl();

        if (backDetailsLink) {
            backDetailsLink.href = targetDetailsUrl;
        }

        cancelEditButton?.addEventListener("click", event => {
            event.preventDefault();
            window.location.href = targetDetailsUrl;
        });

        if (!currentRecord) {
            form.innerHTML = `
                <section class="panel-card not-found">
                    <i data-lucide="file-question"></i>

                    <h2>Pesquisa não encontrada para edição</h2>

                    <p>
                        Não foi possível localizar o registro solicitado.
                    </p>

                    <a class="action-link" href="${escapeHTML(overviewUrl())}">
                        Voltar para Pesquisas
                    </a>
                </section>
            `;

            if (window.lucide) {
                window.lucide.createIcons();
            }

            return;
        }

        // --------------------------------------
        // IDENTIFICAÇÃO
        // --------------------------------------

        const headerId = form.querySelector("[data-edit-id]");

        if (headerId) {
            if ("value" in headerId) {
                headerId.value = currentRecord.id;
            } else {
                headerId.textContent = currentRecord.id;
            }
        }

        function setValue(selectors, value) {
            const selectorsArray = Array.isArray(selectors)
                ? selectors
                : [selectors];

            for (const selector of selectorsArray) {
                const element = form.querySelector(selector);

                if (element && value != null) {
                    element.value = value;
                    return;
                }
            }
        }

        setValue(
            ["#protocolo", "#id-pesquisa"],
            currentRecord.protocolo || currentRecord.id
        );

        setValue(
            ["#titulo", "#nome-pesquisa"],
            currentRecord.nome
        );

        setValue(
            ["#dataInicio", "#data-inicio"],
            dateForInput(currentRecord.dataInicio)
        );

        setValue(
            ["#objetivo", "#objetivo-central"],
            currentRecord.objetivo
        );

        setValue(
            ["#metodologia", "#descricao-metodologia"],
            currentRecord.metodologia
        );

        setValue(
            ["#cientista", "#cientista-responsavel"],
            currentRecord.cientista
        );

        // --------------------------------------
        // ÁREA CIENTÍFICA
        // --------------------------------------

        const areaSelect = form.querySelector(
            "#area, #area-cientifica"
        );

        if (areaSelect && currentRecord.area) {
            const area = String(currentRecord.area)
                .trim()
                .toLowerCase();

            const matchOption = [
                ...areaSelect.options
            ].find(option =>
                option.textContent.trim().toLowerCase() === area ||
                option.value.trim().toLowerCase() === area
            );

            if (matchOption) {
                areaSelect.value = matchOption.value;
            }
        }

        // --------------------------------------
        // STATUS
        // --------------------------------------

        setupEditStatuses(form, currentRecord.status);

        // --------------------------------------
        // AUXILIARES
        // --------------------------------------

        const auxiliaryBlock = form.querySelector(
            "[data-edit-auxiliares]"
        );

        if (auxiliaryBlock) {
            auxiliaryBlock.innerHTML = "";

            (currentRecord.auxiliares || []).forEach(name => {
                auxiliaryBlock.appendChild(
                    createMissionChip(name)
                );
            });
        }

        // --------------------------------------
        // AMOSTRAS
        // --------------------------------------

        const sampleList = form.querySelector(
            "[data-edit-amostras]"
        );

        if (sampleList) {
            sampleList.innerHTML = "";

            (currentRecord.amostras || []).forEach(sample => {
                if (typeof sample === "string") {
                    sampleList.appendChild(
                        createMonitoredItem(sample, "—")
                    );

                    return;
                }

                if (sample?.nome && sample?.id) {
                    sampleList.appendChild(
                        createMonitoredItem(sample.nome, sample.id)
                    );
                }
            });
        }

        // --------------------------------------
        // ARQUIVOS
        // --------------------------------------

        const fileList = form.querySelector(".file-list");

        if (fileList) {
            fileList.innerHTML = "";

            (currentRecord.arquivos || []).forEach(file => {
                if (file?.nome) {
                    fileList.appendChild(
                        createFileElement(file)
                    );
                }
            });
        }

        if (window.lucide) {
            window.lucide.createIcons();
        }

        // --------------------------------------
        // SALVAR ALTERAÇÕES
        // --------------------------------------

        form.addEventListener("submit", event => {
            event.preventDefault();

            if (!form.reportValidity()) return;

            function getFieldValue(selectors) {
                const selectorsArray = Array.isArray(selectors)
                    ? selectors
                    : [selectors];

                for (const selector of selectorsArray) {
                    const element = form.querySelector(selector);

                    if (element) {
                        return element.value.trim();
                    }
                }

                return "";
            }

            const selectedStatus = form.querySelector(
                'input[name="estado"]:checked'
            )?.value;

            const area = form.querySelector(
                "#area option:checked, #area-cientifica option:checked"
            )?.textContent.trim() || currentRecord.area;

            const updatedRecord = {
                ...currentRecord,

                // O código original nunca muda.
                id: currentRecord.id,

                protocolo: getFieldValue("#protocolo") ||
                    currentRecord.protocolo ||
                    currentRecord.id,

                nome: getFieldValue([
                    "#titulo",
                    "#nome-pesquisa"
                ]),

                area,

                dataInicio: getFieldValue([
                    "#dataInicio",
                    "#data-inicio"
                ]),

                objetivo: getFieldValue([
                    "#objetivo",
                    "#objetivo-central"
                ]),

                metodologia: getFieldValue([
                    "#metodologia",
                    "#descricao-metodologia"
                ]),

                cientista: getFieldValue([
                    "#cientista",
                    "#cientista-responsavel"
                ]),

                status: normalizeStatus(
                    selectedStatus || currentRecord.status
                ),

                // Na edição, os chips representam auxiliares.
                auxiliares: collectChips(
                    form,
                    "[data-edit-auxiliares]"
                ),

                // Na edição, a lista representa amostras.
                amostras: collectSamples(form),

                // Preserva missões e humanos já cadastrados,
                // pois eles não possuem campos nesta tela.
                missoes: currentRecord.missoes || [],
                humanosMonitorados:
                    currentRecord.humanosMonitorados || [],

                arquivos: collectFiles(form),

                atualizadoEm: new Date().toISOString()
            };

            const latestItems = readAll();

            const index = latestItems.findIndex(
                item => String(item.id) === String(currentRecord.id)
            );

            if (index >= 0) {
                latestItems[index] = updatedRecord;
            } else {
                // Caso seja uma pesquisa inicial estática,
                // passa a ser salva no localStorage.
                latestItems.push(updatedRecord);
            }

            if (!writeAll(latestItems)) return;

            alert("Alterações da pesquisa salvas com sucesso!");

            window.location.href = detailsUrl(currentRecord.id);
        });
    }

    // ==========================================
    // INICIALIZAÇÃO
    // ==========================================

    document.addEventListener("DOMContentLoaded", () => {
        connectNavigation();

        setupForm();
        setupEditForm();

        setupAssociations();
        setupAssistants();
        setupFiles();

        setupOverview();
        setupDetails();

        if (window.lucide) {
            window.lucide.createIcons();
        }
    });

})();
