/* Integração das telas de Pesquisas AMS
   Armazenamento demonstrativo no navegador (localStorage).
*/

(() => {
    "use strict";

    const STORAGE_KEY = "ams_pesquisas";
    const DELETION_REQUESTS_KEY = "ams_solicitacoes_exclusao";
    const OVERVIEW_PAGE = "pesquisa-visao-geral.html";
    const FORM_PAGE = "pesquisa-cadastro.html";
    const DETAILS_PAGE = "pesquisa-detalhes.html";
    const EDIT_PAGE = "pesquisa-editar.html";
    const MAX_FILE_SIZE = 25 * 1024 * 1024;
    const ALLOWED_EXTENSIONS = [".pdf", ".holo", ".png"];

    const readAll = () => {
        try {
            const data = JSON.parse(localStorage.getItem(STORAGE_KEY) || "[]");
            return Array.isArray(data) ? data : [];
        } catch {
            return [];
        }
    };

    const writeAll = (items) => {
        try {
            localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
            return true;
        } catch (error) {
            console.error("Erro ao salvar no localStorage:", error);
            alert("Não foi possível salvar os dados. O armazenamento do navegador pode estar cheio.");
            return false;
        }
    };

    const escapeHTML = (value) => String(value ?? "").replace(/[&<>"']/g, char => ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&#39;"
    })[char]);

    const normalizeStatus = (value) => {
        const text = String(value || "").trim().toLowerCase();

        const map = {
            progresso: "Em progresso",
            "em progresso": "Em progresso",
            concluida: "Concluída",
            "concluída": "Concluída",
            inconclusiva: "Inconclusiva",
            abortada: "Abortada",
            abordada: "Abortada"
        };

        return map[text] || value || "Em progresso";
    };

    const statusClass = (status) => ({
        "Em progresso": "progress",
        "Concluída": "completed",
        "Inconclusiva": "inconclusive",
        "Abortada": "aborted"
    }[status] || "progress");

    const overviewUrl = () =>
        new URL(OVERVIEW_PAGE, window.location.href).href;

    const formUrl = () =>
        new URL(FORM_PAGE, window.location.href).href;

    const detailsUrl = id => {
        const url = new URL(DETAILS_PAGE, window.location.href);
        url.searchParams.set("id", id);
        return url.href;
    };

    const editUrl = id => {
        const url = new URL(EDIT_PAGE, window.location.href);
        url.searchParams.set("id", id);
        return url.href;
    };

    // ==========================================
    // NAVEGAÇÃO ENTRE AS TELAS
    // ==========================================

    function connectNavigation() {
        const path = window.location.pathname.toLowerCase();
        const isForm = path.endsWith(FORM_PAGE) || Boolean(document.querySelector(".form-grid:not([data-edit-form])"));
        const isEdit = path.endsWith(EDIT_PAGE) || Boolean(document.querySelector("[data-edit-form]"));
        const newButton = document.querySelector(".btn-primary");

        if (!isForm && !isEdit && newButton) {
            newButton.addEventListener("click", (event) => {
                if (!newButton.closest("form")) {
                    event.preventDefault();
                    window.location.href = formUrl();
                }
            });
        }

        

        const cancelButton = document.querySelector(".btn-cancel:not([data-action='cancel-edit'])");

        if (cancelButton) {
            cancelButton.addEventListener("click", () => {
                window.location.href = overviewUrl();
            });
        }
    }

    // ==========================================
    // GERAÇÃO AUTOMÁTICA DO ID
    // ==========================================

    function nextId(existingRows = []) {
        const stored = readAll();
        const ids = [
            ...stored.map(item => item.id),
            ...existingRows.map(row => row.id)
        ];

        const highest = ids.reduce((max, id) => {
            const number = Number(String(id || "").match(/(\d+)$/)?.[1] || 0);
            return Math.max(max, number);
        }, 6);

        return `PESQ-${String(highest + 1).padStart(3, "0")}`;
    }

    // ==========================================
    // FORMATAÇÃO DE ARQUIVOS
    // ==========================================

    function formatFileSize(bytes) {
        if (bytes < 1024 * 1024) {
            return `${(bytes / 1024).toFixed(1)} KB`;
        }

        return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
    }

    function getFileExtension(filename) {
        const index = filename.lastIndexOf(".");
        return index >= 0 ? filename.slice(index).toLowerCase() : "";
    }

    // ==========================================
    // ASSOCIAÇÕES TÁTICAS
    // ==========================================

    function setupAssociations() {
        const missionBlock = document.querySelector(".chips-row");
        const monitoredList = document.querySelector(".monitored-list");

        if (!missionBlock || !monitoredList) return;

        missionBlock.addEventListener("click", event => {
            const button = event.target.closest("button");
            if (button) button.closest(".mission-chip")?.remove();
        });

        monitoredList.addEventListener("click", event => {
            const button = event.target.closest(".remove-btn");
            if (button) button.closest(".monitored-item")?.remove();
        });

        const missionButton = missionBlock
            .closest(".assoc-block")
            ?.querySelector(".link-action");

        if (missionButton) {
            missionButton.addEventListener("click", () => {
                const mission = prompt("Informe o nome ou número da missão:");
                if (!mission || !mission.trim()) return;

                const name = mission.trim();
                const alreadyExists = [
                    ...missionBlock.querySelectorAll(".mission-chip")
                ].some(chip => {
                    const clone = chip.cloneNode(true);
                    clone.querySelector("button")?.remove();
                    return clone.textContent.trim().toLowerCase() === name.toLowerCase();
                });

                if (alreadyExists) {
                    alert("Essa missão já está vinculada.");
                    return;
                }

                const chip = document.createElement("span");
                chip.className = "mission-chip";

                const dot = document.createElement("span");
                dot.className = "dot-status cyan";

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.setAttribute("aria-label", `Remover ${name}`);
                removeButton.textContent = "×";

                chip.append(dot, document.createTextNode(` ${name} `), removeButton);
                missionBlock.appendChild(chip);
            });
        }

        const humanButton = monitoredList
            .closest(".assoc-block")
            ?.querySelector(".link-action");

        if (humanButton) {
            humanButton.addEventListener("click", () => {
                const name = prompt("Informe o nome do humano monitorado:");
                if (!name || !name.trim()) return;

                const id = prompt("Informe o ID do humano:");
                if (!id || !id.trim()) return;

                const cleanName = name.trim();
                const cleanId = id.trim();

                const alreadyExists = [
                    ...monitoredList.querySelectorAll(".monitored-item")
                ].some(item =>
                    item.querySelector(".monitored-info .mono")
                        ?.textContent.trim().toLowerCase() === cleanId.toLowerCase()
                );

                if (alreadyExists) {
                    alert("Esse ID já está vinculado.");
                    return;
                }

                const item = document.createElement("div");
                item.className = "monitored-item";

                const avatar = document.createElement("span");
                avatar.className = "monitored-avatar";
                avatar.textContent = "Ψ";

                const info = document.createElement("div");
                info.className = "monitored-info";

                const strong = document.createElement("strong");
                strong.textContent = cleanName;

                const idSpan = document.createElement("span");
                idSpan.className = "mono";
                idSpan.textContent = cleanId;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "remove-btn";
                removeButton.setAttribute("aria-label", `Remover ${cleanName}`);
                removeButton.textContent = "×";

                info.append(strong, idSpan);
                item.append(avatar, info, removeButton);
                monitoredList.appendChild(item);
            });
        }
    }

    // ==========================================
    // ARQUIVOS E HOLOGRAFIAS
    // ==========================================

    function setupFiles() {
        const dropzone = document.querySelector(".dropzone");
        const fileList = document.querySelector(".file-list");
        if (!dropzone || !fileList) return;

        let fileInput = dropzone.querySelector("input[type='file']");

        if (!fileInput) {
            fileInput = document.createElement("input");
            fileInput.type = "file";
            fileInput.accept = ".pdf,.holo,.png";
            fileInput.multiple = true;
            fileInput.hidden = true;
            fileInput.className = "file-input";
            dropzone.appendChild(fileInput);
        }

        const renderFile = (file) => {
            const item = document.createElement("div");
            item.className = "file-item";

            const icon = document.createElement("i");
            icon.setAttribute("data-lucide", "file-text");
            icon.className = "text-cyan";

            const name = document.createElement("span");
            name.className = "file-name mono";
            name.textContent = file.name;

            const size = document.createElement("span");
            size.className = "file-size mono";
            size.textContent = formatFileSize(file.size);

            const removeButton = document.createElement("button");
            removeButton.type = "button";
            removeButton.className = "remove-btn";
            removeButton.setAttribute("aria-label", `Remover arquivo ${file.name}`);
            removeButton.textContent = "×";

            item.append(icon, name, size, removeButton);
            fileList.appendChild(item);

            if (window.lucide) window.lucide.createIcons();
        };

        fileList.addEventListener("click", event => {
            const button = event.target.closest(".remove-btn");
            if (button) button.closest(".file-item")?.remove();
        });

        const processFiles = (files) => {
            [...files].forEach(file => {
                const extension = getFileExtension(file.name);

                if (!ALLOWED_EXTENSIONS.includes(extension)) {
                    alert(`Formato não permitido: ${file.name}`);
                    return;
                }

                if (file.size > MAX_FILE_SIZE) {
                    alert(`O arquivo ${file.name} ultrapassa o limite de 25 MB.`);
                    return;
                }

                const alreadyExists = [
                    ...fileList.querySelectorAll(".file-name")
                ].some(element =>
                    element.textContent.toLowerCase() === file.name.toLowerCase()
                );

                if (alreadyExists) {
                    alert(`O arquivo ${file.name} já está na lista.`);
                    return;
                }

                renderFile(file);
            });

            fileInput.value = "";
        };

        dropzone.addEventListener("click", event => {
            if (event.target === fileInput || event.target.closest("button")) return;
            fileInput.click();
        });

        dropzone.addEventListener("keydown", event => {
            if (event.key === "Enter" || event.key === " ") {
                event.preventDefault();
                fileInput.click();
            }
        });

        fileInput.addEventListener("change", () => processFiles(fileInput.files));

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

    // ==========================================
    // CAPTURA DAS ASSOCIAÇÕES E ARQUIVOS
    // ==========================================

    function collectMissions() {
        return [
            ...document.querySelectorAll(".chips-row .mission-chip")
        ].map(chip => {
            const clone = chip.cloneNode(true);
            clone.querySelector("button")?.remove();
            return clone.textContent.trim();
        }).filter(Boolean);
    }

    function collectHumans() {
        return [
            ...document.querySelectorAll(".monitored-list .monitored-item")
        ].map(item => ({
            nome: item.querySelector(".monitored-info strong")?.textContent.trim() || "",
            id: item.querySelector(".monitored-info .mono")?.textContent.trim() || ""
        })).filter(human => human.nome && human.id);
    }

    function collectFiles() {
        return [
            ...document.querySelectorAll(".file-list .file-item")
        ].map(item => ({
            nome: item.querySelector(".file-name")?.textContent.trim() || "",
            tamanho: item.querySelector(".file-size")?.textContent.trim() || "",
            tipo: getFileExtension(
                item.querySelector(".file-name")?.textContent.trim() || ""
            )
        })).filter(file => file.nome);
    }

    // ==========================================
    // CADASTRO DE PESQUISAS
    // ==========================================

    function setupForm() {
        const form = document.querySelector(".form-grid:not([data-edit-form])");
        if (!form) return;

        const idField = form.querySelector("#id-pesquisa");
        if (idField) idField.value = nextId();

        form.querySelectorAll("input[id], select[id], textarea[id]")
            .forEach(field => {
                if (!field.name) field.name = field.id;
            });

        const syncRadioStates = () => {
            form.querySelectorAll(".radio-option").forEach(option => {
                const input = option.querySelector('input[type="radio"]');
                option.classList.toggle("active-progress", Boolean(input?.checked));
            });
        };

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

            const assistants = [
                ...form.querySelectorAll(
                    ".assistants-grid input[type='checkbox']:checked"
                )
            ].map(input =>
                input.closest(".assistant-card")
                    ?.querySelector(".assistant-info strong")
                    ?.textContent.trim()
            ).filter(Boolean);

            const record = {
                id: value("id-pesquisa") || nextId(),
                nome: value("nome-pesquisa"),
                area: form.querySelector("#area-cientifica option:checked")
                    ?.textContent.trim() || "",
                dataInicio: value("data-inicio"),
                objetivo: value("objetivo-central"),
                metodologia: value("descricao-metodologia"),
                cientista: value("cientista-responsavel"),
                auxiliares: assistants,
                status: normalizeStatus(statusValue),
                missoes: collectMissions(),
                humanosMonitorados: collectHumans(),
                arquivos: collectFiles(),
                criadoEm: new Date().toISOString()
            };

            const items = readAll();
            items.push(record);

            if (!writeAll(items)) return;

            alert("Pesquisa cadastrada com sucesso!");
            window.location.href = overviewUrl();
        });
    }

    // ==========================================
    // VISÃO GERAL DAS PESQUISAS + PAGINAÇÃO
    // ==========================================

    function setupOverview() {
        const tbody = document.querySelector(".table-container tbody");
        if (!tbody) return;

        const ITEMS_PER_PAGE = 6;

        const originalRows = [...tbody.querySelectorAll("tr")]
            .map(row => {
                const cells = row.querySelectorAll("td");
                if (cells.length < 5) return null;

                return {
                    id: cells[0].innerText.replace("•", "").trim(),
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
            })
            .filter(Boolean);

        const records = [
            ...originalRows,
            ...readAll().map(item => ({
                ...item,
                id: item.id,
                nome: item.nome,
                resumo: item.objetivo || "Pesquisa cadastrada",
                area: item.area,
                cientista: item.cientista,
                status: normalizeStatus(item.status)
            }))
        ];

        const searchInput = document.querySelector(".search-box input");
        const pills = [...document.querySelectorAll(".filter-pills .pill")];
        const count = document.querySelector(".table-count");
        const pagination = document.querySelector(".pagination");
        const pageInfo = pagination?.querySelector(".page-info");
        const pageControls = pagination?.querySelector(".page-controls");

        const openResearchDetails = row => {
            const id = row?.dataset.researchId;
            if (id) window.location.href = detailsUrl(id);
        };

        tbody.addEventListener("click", event => {
            const row = event.target.closest("tr[data-research-id]");
            if (row) openResearchDetails(row);
        });

        tbody.addEventListener("keydown", event => {
            if (event.key !== "Enter" && event.key !== " ") return;
            const row = event.target.closest("tr[data-research-id]");
            if (!row) return;
            event.preventDefault();
            openResearchDetails(row);
        });

        let activeFilter = "todos";
        let currentPage = 1;

        const filterFromLabel = label => {
            const text = label.toLowerCase();

            if (text.includes("progresso")) return "Em progresso";
            if (text.includes("inconclus")) return "Inconclusiva";
            if (text.includes("conclu")) return "Concluída";
            if (text.includes("abort")) return "Abortada";
            return "todos";
        };

        const filterLabels = {
            todos: "TODOS",
            "Em progresso": "EM PROGRESSO",
            "Concluída": "CONCLUÍDA",
            "Inconclusiva": "INCONCLUSIVA",
            "Abortada": "ABORTADA"
        };

        const countByStatus = status =>
            records.filter(item => status === "todos" || item.status === status).length;

        function updateCounters() {
            const counts = {
                total: records.length,
                progress: countByStatus("Em progresso"),
                completed: countByStatus("Concluída"),
                inconclusive: countByStatus("Inconclusiva"),
                aborted: countByStatus("Abortada")
            };

            const keys = {
                todos: counts.total,
                "Em progresso": counts.progress,
                "Concluída": counts.completed,
                "Inconclusiva": counts.inconclusive,
                "Abortada": counts.aborted
            };

            pills.forEach(pill => {
                const status = filterFromLabel(pill.textContent);
                const label = filterLabels[status] || filterLabels.todos;

                pill.textContent = `${label} (${keys[status]})`;
                pill.classList.toggle("active", activeFilter === status);
                pill.setAttribute("aria-pressed", String(activeFilter === status));
            });

            Object.entries(counts).forEach(([key, amount]) => {
                const element = document.querySelector(
                    `.kpi-card.${key} .kpi-number`
                );

                if (element) element.textContent = String(amount).padStart(2, "0");
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
                    activeFilter === "todos" || item.status === activeFilter;

                return matchesSearch && matchesStatus;
            });
        }

        function renderPagination(totalPages) {
            if (!pagination || !pageControls) return;

            if (pageInfo) {
                pageInfo.textContent =
                    `PÁGINA ${String(currentPage).padStart(2, "0")} DE ${String(totalPages).padStart(2, "0")}`;
            }

            pageControls.innerHTML = "";

            const createButton = (label, page, options = {}) => {
                const button = document.createElement("button");
                button.type = "button";
                button.className = "page-btn";
                button.textContent = label;
                button.disabled = Boolean(options.disabled);

                if (options.active) {
                    button.classList.add("active");
                    button.setAttribute("aria-current", "page");
                }

                button.addEventListener("click", () => {
                    if (page < 1 || page > totalPages || page === currentPage) return;
                    currentPage = page;
                    render();
                });

                pageControls.appendChild(button);
            };

            createButton("<", currentPage - 1, { disabled: currentPage === 1 });

            for (let page = 1; page <= totalPages; page++) {
                createButton(String(page), page, {
                    active: page === currentPage
                });
            }

            createButton(">", currentPage + 1, {
                disabled: currentPage === totalPages
            });
        }

        function render() {
            const filtered = getFilteredRecords();
            const totalPages = Math.max(1, Math.ceil(filtered.length / ITEMS_PER_PAGE));

            if (currentPage > totalPages) currentPage = totalPages;

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
                        <tr class="research-row" data-research-id="${escapeHTML(item.id)}" tabindex="0" role="link" aria-label="Ver detalhes da pesquisa ${escapeHTML(item.id)}">
                            <td>
                                <span class="id-code text-cyan">
                                    • ${escapeHTML(item.id)}
                                </span>
                            </td>
                            <td>
                                <div class="research-title">${shortName}</div>
                                <div class="research-sub">
                                    ${escapeHTML(item.resumo || "—")}
                                </div>
                            </td>
                            <td>
                                <span class="category-badge">
                                    ${escapeHTML(item.area)}
                                </span>
                            </td>
                            <td>
                                <div class="scientist">
                                    <span class="avatar-icon cyan-tint">Ψ</span>
                                    <span>${escapeHTML(item.cientista)}</span>
                                </div>
                            </td>
                            <td>
                                <span class="status-pill ${css}">
                                    • ${escapeHTML(item.status)}
                                </span>
                            </td>
                        </tr>
                    `;
                }).join("");
            }

            if (count) {
                const first = filtered.length === 0 ? 0 : startIndex + 1;
                const last = Math.min(startIndex + ITEMS_PER_PAGE, filtered.length);

                count.innerHTML = `
                    Exibindo <strong>${first}–${last}</strong>
                    de ${filtered.length} registros
                `;
            }

            updateCounters();
            renderPagination(totalPages);

            if (window.lucide) window.lucide.createIcons();
        }

        if (searchInput) {
            searchInput.addEventListener("input", () => {
                currentPage = 1;
                render();
            });
        }

        pills.forEach(pill => {
            pill.addEventListener("click", () => {
                activeFilter = filterFromLabel(pill.textContent);
                currentPage = 1;
                render();
            });
        });

        render();
    }

    // ==========================================
    // DETALHES DINÂMICOS DA PESQUISA E MODAL
    // ==========================================

    function setupDeletionModal(record) {
        const trigger = document.querySelector('[data-action="delete"]');
        const modal = document.getElementById("modalSolicitarExclusao");
        if (!trigger || !modal || !record) return;

        const form = modal.querySelector("#formSolicitarExclusao");
        const textarea = modal.querySelector("#motivoExclusao");
        const idLabel = modal.querySelector('[data-field="id"]');
        const scientistLabel = modal.querySelector('[data-field="cientista"]');
        const closeButtons = modal.querySelectorAll("[data-modal-close]");

        const openModal = () => {
            if (idLabel) idLabel.textContent = `REGISTRO ${record.id}`;
            if (scientistLabel) scientistLabel.textContent = record.cientista || "Cientista Responsável";

            modal.hidden = false;
            modal.setAttribute("aria-hidden", "false");
            textarea?.focus();
        };

        const closeModal = () => {
            modal.hidden = true;
            modal.setAttribute("aria-hidden", "true");
            form?.reset();
        };

        trigger.addEventListener("click", openModal);
        closeButtons.forEach(btn => btn.addEventListener("click", closeModal));

        modal.addEventListener("click", event => {
            if (event.target === modal) closeModal();
        });

        document.addEventListener("keydown", event => {
            if (event.key === "Escape" && !modal.hidden) closeModal();
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
                requests = JSON.parse(localStorage.getItem(DELETION_REQUESTS_KEY) || "[]");
                if (!Array.isArray(requests)) requests = [];
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
                localStorage.setItem(DELETION_REQUESTS_KEY, JSON.stringify(requests));
            } catch (error) {
                console.error("Erro ao salvar solicitação de exclusão:", error);
                alert("Não foi possível registrar a solicitação no armazenamento do navegador.");
                return;
            }

            alert("Solicitação de exclusão registrada e encaminhada para auditoria do CEO.");
            closeModal();
        });
    }

    function setupDetails() {
        const page = document.querySelector("[data-research-details]");
        if (!page) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const stored = readAll().find(item => String(item.id) === String(id));

        const initialRecords = {
            "PESQ-001": { id: "PESQ-001", nome: "Análise de Resposta Neural...", area: "Neurologia Humana", cientista: "Cientista Etriz", status: "Em progresso", resumo: "Amostra: 14 Espécimes // Setor Beta-3 // Taxa de Adaptação: 68%" },
            "PESQ-002": { id: "PESQ-002", nome: "Mutação Genética Induzida por...", area: "Xenobiologia", cientista: "Cientista Alielaine", status: "Concluída", resumo: "Sequenciamento Genômico Cruzado // Telômeros Estabilizados" },
            "PESQ-003": { id: "PESQ-003", nome: "Comportamento Social sob...", area: "Comportamento Terrestre", cientista: "Cientista Etmorg", status: "Inconclusiva", resumo: "Câmara Hiperbárica 04 // Desvio Psicométrico Inesperado" },
            "PESQ-004": { id: "PESQ-004", nome: "Mapeamento Biocelular de...", area: "Bioquímica", cientista: "Cientista Etriz", status: "Em progresso", resumo: "Origem: Quadrante América do Sul // Proteínas Sintéticas Estáveis" },
            "PESQ-005": { id: "PESQ-005", nome: "Cinética de Regeneração...", area: "Bioquímica", cientista: "Cientista Alielaine", status: "Concluída", resumo: "Aceleração com Gel Dérmico Xenomorfo // Eficiência +340%" },
            "PESQ-006": { id: "PESQ-006", nome: "Ressonância Quântica em...", area: "Neurologia Humana", cientista: "Cientista Etmorg", status: "Abortada", resumo: "Interrupção por Risco de Colapso Mental // Veto do Comando Alpha" }
        };

        const record = stored || initialRecords[id];
        const setText = (selector, value, fallback = "Não informado") => {
            page.querySelectorAll(selector).forEach(element => {
                element.textContent = value == null || value === "" ? fallback : value;
            });
        };
        const safe = value => escapeHTML(value == null || value === "" ? "Não informado" : value);
        const listMarkup = (items, formatter) => items?.length
            ? items.map(formatter).join("")
            : '<li class="muted-item">Nenhum registro informado.</li>';

        if (!record) {
            page.querySelector(".details-content").innerHTML = `
                <section class="panel-card not-found">
                    <i data-lucide="file-question"></i>
                    <h2>Pesquisa não encontrada</h2>
                    <p>Não foi possível localizar o registro solicitado.</p>
                    <a class="action-link" href="${OVERVIEW_PAGE}">Voltar para Pesquisas</a>
                </section>`;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        document.title = `AMS - ${record.id} | Detalhes da Pesquisa`;
        setText("[data-field='id']", record.id);
        setText("[data-field='area']", record.area);
        setText("[data-field='nome']", record.nome);
        setText("[data-field='status']", normalizeStatus(record.status));
        setText("[data-field='cientista']", record.cientista);
        setText("[data-field='data-criacao']", record.dataCriacao || record.criadoEm ? new Date(record.criadoEm || record.dataCriacao).toLocaleString("pt-BR") : "Não informado");
        setText("[data-field='data-inicio']", record.dataInicio);
        setText("[data-field='data-conclusao']", record.dataConclusao);
        setText("[data-field='resumo']", record.resumo || record.objetivo);
        setText("[data-field='objetivo']", record.objetivo);
        setText("[data-field='metodologia']", record.metodologia);
        setText("[data-field='relatorio']", record.relatorio);
        setText("[data-field='historico']", record.historico);
        setText("[data-field='total-amostras']", record.amostras?.length ? String(record.amostras.length) : "Não informado");

        const status = page.querySelector(".detail-status");
        if (status) status.classList.add(statusClass(normalizeStatus(record.status)));

        const missions = page.querySelector("[data-list='missoes']");
        if (missions) missions.innerHTML = listMarkup(record.missoes, item => `<li>${safe(item)}</li>`);
        const humans = page.querySelector("[data-list='humanos']");
        if (humans) humans.innerHTML = listMarkup(record.humanosMonitorados, item => `<li><strong>${safe(item.nome)}</strong><span>${safe(item.id)}</span></li>`);
        const assistants = page.querySelector("[data-list='auxiliares']");
        if (assistants) assistants.innerHTML = listMarkup(record.auxiliares, item => `<li>${safe(item)}</li>`);
        const files = page.querySelector("[data-list='arquivos']");
        if (files) files.innerHTML = listMarkup(record.arquivos, item => `<li><span>${safe(item.nome)}</span><small>${safe(item.tamanho)}</small></li>`);
        const samples = page.querySelector("[data-list='amostras']");
        if (samples) samples.innerHTML = listMarkup(record.amostras, item => `<li>${safe(typeof item === "string" ? item : item.nome || item.tipo)}</li>`);

        const back = page.querySelector("[data-action='back']");
        if (back) back.href = OVERVIEW_PAGE;

        const edit = document.querySelector("[data-action='edit']");
        if (edit) edit.href = editUrl(record.id);

        setupDeletionModal(record);

        page.querySelectorAll("[data-tab]").forEach(button => {
            button.addEventListener("click", () => {
                const target = button.dataset.tab;
                page.querySelectorAll("[data-tab]").forEach(tab => {
                    const active = tab === button;
                    tab.classList.toggle("active", active);
                    tab.setAttribute("aria-selected", String(active));
                });
                page.querySelectorAll("[data-panel]").forEach(panel => {
                    panel.hidden = panel.dataset.panel !== target;
                });
            });
        });

        if (window.lucide) window.lucide.createIcons();
    }

    // ==========================================
    // CHECKBOXES DOS CIENTISTAS AUXILIARES
    // ==========================================

    function setupAssistants() {
        document.querySelectorAll(".assistant-card").forEach(card => {
            const checkbox = card.querySelector('input[type="checkbox"]');
            if (!checkbox) return;

            card.classList.toggle("checked", checkbox.checked);

            checkbox.addEventListener("change", () => {
                card.classList.toggle("checked", checkbox.checked);
            });
        });
    }

    // ==========================================
    // EDIÇÃO DE PESQUISAS
    // ==========================================

    function setupEditForm() {
        const form = document.querySelector("[data-edit-form]");
        if (!form) return;

        const params = new URLSearchParams(window.location.search);
        const id = params.get("id");
        const items = readAll();
        const existingIndex = items.findIndex(item => String(item.id) === String(id));
        const currentRecord = existingIndex >= 0 ? items[existingIndex] : null;

        const backDetailsLink = document.querySelector('[data-action="back-details"]');
        const cancelEditButton = document.querySelector('[data-action="cancel-edit"]');
        const targetDetailsUrl = id ? detailsUrl(id) : overviewUrl();

        if (backDetailsLink) backDetailsLink.href = targetDetailsUrl;
        if (cancelEditButton) {
            cancelEditButton.addEventListener("click", () => {
                window.location.href = targetDetailsUrl;
            });
        }

        if (!currentRecord) {
            form.innerHTML = `
                <section class="panel-card not-found">
                    <i data-lucide="file-question"></i>
                    <h2>Pesquisa não encontrada para edição</h2>
                    <p>Não foi possível localizar o registro solicitado no armazenamento local.</p>
                    <a class="action-link" href="${overviewUrl()}">Voltar para Pesquisas</a>
                </section>
            `;
            if (window.lucide) window.lucide.createIcons();
            return;
        }

        const headerId = document.querySelector("[data-edit-id]");
        if (headerId) headerId.textContent = currentRecord.id;

        const setVal = (selector, val) => {
            const el = form.querySelector(selector);
            if (el && val != null) el.value = val;
        };

        setVal("#id-pesquisa", currentRecord.id);
        setVal("#nome-pesquisa", currentRecord.nome);
        setVal("#data-inicio", currentRecord.dataInicio);
        setVal("#objetivo-central", currentRecord.objetivo);
        setVal("#descricao-metodologia", currentRecord.metodologia);
        setVal("#cientista-responsavel", currentRecord.cientista);

        const areaSelect = form.querySelector("#area-cientifica");
        if (areaSelect && currentRecord.area) {
            const matchOption = [...areaSelect.options].find(
                opt => opt.textContent.trim().toLowerCase() === String(currentRecord.area).trim().toLowerCase() ||
                    opt.value.toLowerCase() === String(currentRecord.area).trim().toLowerCase()
            );
            if (matchOption) areaSelect.value = matchOption.value;
        }

        const normalizedStatus = normalizeStatus(currentRecord.status);
        const statusValueMap = {
            "Em progresso": "progresso",
            "Concluída": "concluida",
            "Inconclusiva": "inconclusiva",
            "Abortada": "abortada"
        };
        const radioValue = statusValueMap[normalizedStatus] || "progresso";
        const targetRadio = form.querySelector(`input[name="estado"][value="${radioValue}"]`);
        if (targetRadio) {
            targetRadio.checked = true;
            form.querySelectorAll(".radio-option").forEach(opt => opt.classList.remove("active-progress"));
            targetRadio.closest(".radio-option")?.classList.add("active-progress");
        }

        const assistants = Array.isArray(currentRecord.auxiliares) ? currentRecord.auxiliares : [];
        form.querySelectorAll(".assistants-grid input[type='checkbox']").forEach(checkbox => {
            const labelName = checkbox.closest(".assistant-card")?.querySelector(".assistant-info strong")?.textContent.trim();
            const isChecked = assistants.includes(checkbox.value) || assistants.includes(labelName);
            checkbox.checked = isChecked;
            checkbox.closest(".assistant-card")?.classList.toggle("checked", isChecked);
        });

        const missionBlock = form.querySelector(".chips-row");
        if (missionBlock && Array.isArray(currentRecord.missoes)) {
            missionBlock.innerHTML = "";
            currentRecord.missoes.forEach(missionName => {
                const chip = document.createElement("span");
                chip.className = "mission-chip";

                const dot = document.createElement("span");
                dot.className = "dot-status cyan";

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.setAttribute("aria-label", `Remover ${missionName}`);
                removeButton.textContent = "×";

                chip.append(dot, document.createTextNode(` ${missionName} `), removeButton);
                missionBlock.appendChild(chip);
            });
        }

        const monitoredList = form.querySelector(".monitored-list");
        if (monitoredList && Array.isArray(currentRecord.humanosMonitorados)) {
            monitoredList.innerHTML = "";
            currentRecord.humanosMonitorados.forEach(human => {
                if (!human?.nome || !human?.id) return;
                const item = document.createElement("div");
                item.className = "monitored-item";

                const avatar = document.createElement("span");
                avatar.className = "monitored-avatar";
                avatar.textContent = "Ψ";

                const info = document.createElement("div");
                info.className = "monitored-info";

                const strong = document.createElement("strong");
                strong.textContent = human.nome;

                const idSpan = document.createElement("span");
                idSpan.className = "mono";
                idSpan.textContent = human.id;

                const removeButton = document.createElement("button");
                removeButton.type = "button";
                removeButton.className = "remove-btn";
                removeButton.setAttribute("aria-label", `Remover ${human.nome}`);
                removeButton.textContent = "×";

                info.append(strong, idSpan);
                item.append(avatar, info, removeButton);
                monitoredList.appendChild(item);
            });
        }

        const fileList = form.querySelector(".file-list");
        if (fileList && Array.isArray(currentRecord.arquivos)) {
            fileList.innerHTML = "";
            currentRecord.arquivos.forEach(file => {
                if (!file?.nome) return;
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
                removeButton.setAttribute("aria-label", `Remover arquivo ${file.nome}`);
                removeButton.textContent = "×";

                item.append(icon, name, size, removeButton);
                fileList.appendChild(item);
            });
            if (window.lucide) window.lucide.createIcons();
        }

        form.querySelectorAll('input[name="estado"]').forEach(radio => {
            radio.addEventListener("change", () => {
                form.querySelectorAll(".radio-option").forEach(option => {
                    option.classList.remove("active-progress");
                });
                radio.closest(".radio-option")?.classList.add("active-progress");
            });
        });

        form.addEventListener("submit", event => {
            event.preventDefault();
            if (!form.reportValidity()) return;

            const value = fieldId => form.querySelector(`#${fieldId}`)?.value.trim() || "";
            const statusValue = form.querySelector('input[name="estado"]:checked')?.value || "progresso";

            const assistantsSelected = [
                ...form.querySelectorAll(".assistants-grid input[type='checkbox']:checked")
            ].map(input =>
                input.closest(".assistant-card")?.querySelector(".assistant-info strong")?.textContent.trim()
            ).filter(Boolean);

            const updatedRecord = {
                ...currentRecord,
                id: currentRecord.id,
                nome: value("nome-pesquisa"),
                area: form.querySelector("#area-cientifica option:checked")?.textContent.trim() || currentRecord.area,
                dataInicio: value("data-inicio"),
                objetivo: value("objetivo-central"),
                metodologia: value("descricao-metodologia"),
                cientista: value("cientista-responsavel"),
                auxiliares: assistantsSelected,
                status: normalizeStatus(statusValue),
                missoes: collectMissions(),
                humanosMonitorados: collectHumans(),
                arquivos: collectFiles(),
                atualizadoEm: new Date().toISOString()
            };

            const latestItems = readAll();
            const idx = latestItems.findIndex(item => String(item.id) === String(currentRecord.id));
            if (idx >= 0) {
                latestItems[idx] = updatedRecord;
                if (!writeAll(latestItems)) return;
            }

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

        if (window.lucide) window.lucide.createIcons();
    });

})();