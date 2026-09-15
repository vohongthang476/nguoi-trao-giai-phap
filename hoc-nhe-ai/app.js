(function () {
  "use strict";

  const $ = id => document.getElementById(id);
  const els = {
    grade: $("grade"), subject: $("subject"), topic: $("topic"), level: $("level"), amount: $("amount"),
    amountLabel: $("amountLabel"), studentNameWrap: $("studentNameWrap"), studentName: $("studentName"),
    roleHint: $("roleHint"), generateBtn: $("generateBtn"), paperSection: $("paperSection"),
    paperTitle: $("paperTitle"), paperMeta: $("paperMeta"), paperStudent: $("paperStudent"),
    sheetTitle: $("sheetTitle"), sheetSubtitle: $("sheetSubtitle"), questionList: $("questionList"),
    answerKey: $("answerKey"), answerList: $("answerList"), scoreBox: $("scoreBox"),
    gradeBtn: $("gradeBtn"), answerBtn: $("answerBtn"), newVersionBtn: $("newVersionBtn"),
    printBtn: $("printBtn"), historyList: $("historyList"), historyEmpty: $("historyEmpty"),
    totalSessions: $("totalSessions"), averageScore: $("averageScore"), bestScore: $("bestScore"),
    lastSubject: $("lastSubject"), clearHistoryBtn: $("clearHistoryBtn"), clearDataTop: $("clearDataTop"),
    confirmDialog: $("confirmDialog"), year: $("year"), explainQuestion: $("explainQuestion"),
    explainBtn: $("explainBtn"), explainOutput: $("explainOutput"), analysisOutput: $("analysisOutput"),
    createPlanBtn: $("createPlanBtn"), planEmpty: $("planEmpty"), dayGrid: $("dayGrid")
  };

  const STORE_KEY = "hocnhe-v1";
  let currentQuestions = [];
  let currentConfig = null;
  let currentResults = [];

  function getState() {
    try {
      return JSON.parse(localStorage.getItem(STORE_KEY)) || { history: [], preferences: {} };
    } catch (_) {
      return { history: [], preferences: {} };
    }
  }

  function saveState(state) {
    try { localStorage.setItem(STORE_KEY, JSON.stringify(state)); } catch (_) {}
  }

  function role() {
    return document.querySelector('input[name="role"]:checked').value;
  }

  function topicName(subject, grade, topic) {
    const found = window.HOCNHE.catalog[subject][grade].find(item => item[0] === topic);
    return found ? found[1] : "Tổng hợp";
  }

  function updateTopics(preferred) {
    const options = window.HOCNHE.catalog[els.subject.value][els.grade.value];
    els.topic.replaceChildren(...options.map(([value, label]) => {
      const opt = document.createElement("option");
      opt.value = value;
      opt.textContent = label;
      return opt;
    }));
    if (preferred && options.some(([value]) => value === preferred)) els.topic.value = preferred;
  }

  function updateRole() {
    const teacher = role() === "teacher";
    els.roleHint.textContent = teacher
      ? "Tạo nhanh phiếu bài tập để in hoặc giao học sinh làm trên thiết bị."
      : "Tạo một buổi luyện ngắn để cùng con học tại nhà.";
    els.amountLabel.childNodes[0].nodeValue = teacher ? "Số câu hỏi " : "Thời lượng ";
    updateAmountOptions(teacher);
    els.studentNameWrap.firstChild.nodeValue = teacher ? "Tên lớp / học sinh " : "Tên gọi của con ";
    els.generateBtn.firstChild.nodeValue = teacher ? "Tạo phiếu cho học sinh " : "Tạo phiếu luyện ngay ";
  }

  function updateAmountOptions(teacher = role() === "teacher") {
    const isVietnamese = els.subject.value === "vietnamese";
    const values = isVietnamese
      ? (teacher ? [["4", "4 câu"], ["6", "6 câu"]] : [["4", "Khoảng 10 phút"], ["6", "Khoảng 15 phút"]])
      : (teacher ? [["6", "6 câu"], ["10", "10 câu"], ["14", "14 câu"]] : [["6", "Khoảng 10 phút"], ["10", "Khoảng 15 phút"], ["14", "Khoảng 20 phút"]]);
    const selected = els.amount.value;
    els.amount.replaceChildren(...values.map(([value, label]) => {
      const opt = document.createElement("option");
      opt.value = value; opt.textContent = label; return opt;
    }));
    els.amount.value = values.some(([value]) => value === selected) ? selected : values[values.length - 1][0];
  }

  function normalize(value) {
    let clean = String(value || "").trim().toLocaleLowerCase("vi").replace(/\s+/g, " ");
    if (/^-?[\d.,]+$/.test(clean)) {
      if (clean.includes(",")) clean = clean.replace(/\./g, "").replace(",", ".");
      else if (/^-?\d{1,3}(\.\d{3})+$/.test(clean)) clean = clean.replace(/\./g, "");
    }
    return clean;
  }

  function escapeText(value) {
    const span = document.createElement("span");
    span.textContent = value;
    return span.innerHTML;
  }

  function plainText(html) {
    const box = document.createElement("div");
    box.innerHTML = html;
    return box.textContent.trim();
  }

  function methodHint(question) {
    if (!currentConfig) return "Đọc kỹ đề và xác định điều cần tìm.";
    if (currentConfig.subject === "vietnamese") {
      if (currentConfig.topic === "doc-hieu") return "Đọc lại đoạn văn, gạch dưới từ khóa trong câu hỏi rồi tìm câu chứa thông tin tương ứng.";
      if (currentConfig.topic === "chinh-ta") return "Đọc chậm từng tiếng, chú ý âm đầu và vần dễ nhầm, sau đó thử đọc lại từ hoàn chỉnh.";
      if (currentConfig.topic === "dau-cau") return "Xác định mục đích của câu: kể, hỏi, cảm hay liệt kê; sau đó chọn dấu câu phù hợp.";
      return "Xác định từ hoặc bộ phận đang được hỏi, rồi loại từng lựa chọn không đúng chức năng hoặc ý nghĩa.";
    }
    if (/chu vi/i.test(question.prompt)) return "Ghi độ dài và chiều rộng, cộng hai số rồi nhân kết quả với 2.";
    if (/diện tích/i.test(question.prompt)) return "Xác định chiều dài và chiều rộng, sau đó lấy chiều dài nhân chiều rộng.";
    if (/%/.test(question.prompt)) return "Đổi phần trăm thành phép chia cho 100, rồi nhân với số đã cho.";
    if (/bằng bao nhiêu|điền số thích hợp/i.test(question.prompt)) return "Nhớ quan hệ giữa hai đơn vị, xác định cần nhân hay chia rồi mới thay số.";
    if (/mỗi|tất cả|bao nhiêu đồng/i.test(question.prompt)) return "Tóm tắt số lượng của một nhóm và số nhóm; thường dùng phép nhân để tìm toàn bộ.";
    if (/[×:]/.test(question.prompt)) return "Dùng bảng nhân/chia tương ứng và kiểm tra ngược bằng phép tính đối lập.";
    return "Đặt các số đúng hàng, chọn phép tính trong đề rồi tính lần lượt từ phải sang trái.";
  }

  function renderQuestions() {
    els.questionList.innerHTML = "";
    els.answerList.innerHTML = "";
    currentQuestions.forEach((q, index) => {
      const li = document.createElement("li");
      li.className = "question";
      li.dataset.index = index;

      const prompt = document.createElement("div");
      prompt.className = "question-prompt";
      prompt.innerHTML = q.prompt;
      li.appendChild(prompt);

      if (q.type === "choice") {
        const choices = document.createElement("div");
        choices.className = "choices";
        q.options.forEach(option => {
          const label = document.createElement("label");
          label.className = "choice";
          const input = document.createElement("input");
          input.type = "radio";
          input.name = "q-" + index;
          input.value = option;
          const text = document.createElement("span");
          text.textContent = option;
          label.append(input, text);
          choices.appendChild(label);
        });
        li.appendChild(choices);
      } else {
        const input = document.createElement("input");
        input.type = "text";
        input.className = "text-answer";
        input.dataset.question = index;
        input.autocomplete = "off";
        input.setAttribute("aria-label", "Câu trả lời cho câu " + (index + 1));
        input.placeholder = "Điền đáp án";
        li.appendChild(input);
      }

      const feedback = document.createElement("p");
      feedback.className = "feedback";
      feedback.hidden = true;
      li.appendChild(feedback);
      els.questionList.appendChild(li);

      const answerLi = document.createElement("li");
      answerLi.innerHTML = `<strong>${escapeText(q.answer)}</strong> — ${escapeText(q.explanation)}`;
      els.answerList.appendChild(answerLi);
    });
    els.explainQuestion.replaceChildren(...currentQuestions.map((q, index) => {
      const option = document.createElement("option");
      option.value = index;
      option.textContent = `Câu ${index + 1}: ${plainText(q.prompt).slice(0, 62)}${plainText(q.prompt).length > 62 ? "…" : ""}`;
      return option;
    }));
    els.explainBtn.disabled = currentQuestions.length === 0;
  }

  function generate(scrollToPaper = true) {
    currentConfig = {
      role: role(),
      grade: Number(els.grade.value),
      subject: els.subject.value,
      topic: els.topic.value,
      level: els.level.value,
      amount: Number(els.amount.value),
      student: els.studentName.value.trim()
    };
    currentQuestions = window.HOCNHE.generate(
      currentConfig.subject, currentConfig.grade, currentConfig.topic, currentConfig.level, currentConfig.amount
    );
    const subjectLabel = currentConfig.subject === "math" ? "Toán" : "Tiếng Việt";
    const selectedTopic = topicName(currentConfig.subject, currentConfig.grade, currentConfig.topic);
    const levelLabel = { basic: "Cơ bản", mixed: "Vừa sức", challenge: "Thử thách" }[currentConfig.level];

    els.paperTitle.textContent = `${subjectLabel} lớp ${currentConfig.grade} · ${selectedTopic}`;
    els.paperMeta.textContent = `${currentQuestions.length} câu · Mức ${levelLabel.toLowerCase()}`;
    els.sheetTitle.textContent = `PHIẾU LUYỆN ${subjectLabel.toLocaleUpperCase("vi")} — LỚP ${currentConfig.grade}`;
    els.sheetSubtitle.textContent = `${selectedTopic} · ${currentQuestions.length} câu · Mức ${levelLabel}`;
    els.paperStudent.textContent = currentConfig.student || "________________";
    renderQuestions();
    currentResults = [];
    resetCoachPanels();
    els.answerKey.hidden = true;
    els.answerBtn.textContent = "Xem đáp án";
    els.scoreBox.hidden = true;
    els.scoreBox.textContent = "";
    els.paperSection.hidden = false;

    const state = getState();
    state.preferences = { ...currentConfig };
    saveState(state);
    if (scrollToPaper) els.paperSection.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  function selectedAnswer(q, index) {
    if (q.type === "choice") {
      const checked = document.querySelector(`input[name="q-${index}"]:checked`);
      return checked ? checked.value : "";
    }
    const input = document.querySelector(`input[data-question="${index}"]`);
    return input ? input.value : "";
  }

  function gradeQuiz() {
    if (!currentQuestions.length) return;
    let correct = 0;
    currentResults = currentQuestions.map((q, index) => {
      const item = els.questionList.querySelector(`[data-index="${index}"]`);
      const feedback = item.querySelector(".feedback");
      const answer = selectedAnswer(q, index);
      const isCorrect = normalize(answer) === normalize(q.answer);
      item.classList.remove("correct", "incorrect");
      item.classList.add(isCorrect ? "correct" : "incorrect");
      feedback.hidden = false;
      if (isCorrect) {
        correct++;
        feedback.textContent = "Đúng. " + q.explanation;
      } else {
        feedback.textContent = answer
          ? `Chưa đúng. Đáp án: ${q.answer}. ${q.explanation}`
          : `Chưa trả lời. Đáp án: ${q.answer}. ${q.explanation}`;
      }
      return { index, answer, isCorrect, unanswered: !answer };
    });

    const score = Math.round(correct / currentQuestions.length * 100);
    els.scoreBox.hidden = false;
    els.scoreBox.innerHTML = `Kết quả: <strong>${correct}/${currentQuestions.length}</strong> · ${score}%`;
    saveResult(correct, currentQuestions.length, score, currentResults);
    renderAnalysis();
    renderHistory();
    els.scoreBox.scrollIntoView({ behavior: "smooth", block: "nearest" });
  }

  function saveResult(correct, total, score, results) {
    const state = getState();
    const item = {
      id: Date.now(),
      date: new Date().toISOString(),
      grade: currentConfig.grade,
      subject: currentConfig.subject,
      topic: topicName(currentConfig.subject, currentConfig.grade, currentConfig.topic),
      correct, total, score,
      wrong: results.filter(item => !item.isCorrect).length,
      unanswered: results.filter(item => item.unanswered).length
    };
    state.history = [item, ...(state.history || [])].slice(0, 12);
    saveState(state);
  }

  function renderHistory() {
    const history = getState().history || [];
    els.totalSessions.textContent = history.length;
    els.averageScore.textContent = history.length ? Math.round(history.reduce((sum, item) => sum + item.score, 0) / history.length) + "%" : "—";
    els.bestScore.textContent = history.length ? Math.max(...history.map(item => item.score)) + "%" : "—";
    els.lastSubject.textContent = history.length ? (history[0].subject === "math" ? "Toán" : "Tiếng Việt") : "—";
    els.historyEmpty.hidden = history.length > 0;
    els.historyList.innerHTML = "";

    history.forEach(item => {
      const article = document.createElement("article");
      article.className = "history-item";
      const date = new Date(item.date);
      article.innerHTML = `
        <div class="history-score">${item.score}%</div>
        <div class="history-detail">
          <strong>${item.subject === "math" ? "Toán" : "Tiếng Việt"} lớp ${item.grade} · ${escapeText(item.topic)}</strong>
          <small>Đúng ${item.correct}/${item.total} câu</small>
        </div>
        <time class="history-date" datetime="${item.date}">${date.toLocaleDateString("vi-VN")} · ${date.toLocaleTimeString("vi-VN", { hour: "2-digit", minute: "2-digit" })}</time>`;
      els.historyList.appendChild(article);
    });
  }

  function toggleAnswers() {
    els.answerKey.hidden = !els.answerKey.hidden;
    els.answerBtn.textContent = els.answerKey.hidden ? "Xem đáp án" : "Ẩn đáp án";
  }

  function resetCoachPanels() {
    els.explainOutput.className = "explain-output empty-panel";
    els.explainOutput.innerHTML = '<span aria-hidden="true">?</span><p>Chọn một câu để xem cách làm từng bước.</p>';
    els.analysisOutput.className = "analysis-output empty-panel";
    els.analysisOutput.innerHTML = '<span aria-hidden="true">◎</span><p>Chấm phiếu này để xem phân tích.</p>';
  }

  function renderExplanation() {
    const index = Number(els.explainQuestion.value);
    const question = currentQuestions[index];
    if (!question) return;
    els.explainOutput.className = "explain-output empty-panel has-content";
    els.explainOutput.innerHTML = `
      <p class="explain-question">Câu ${index + 1}: ${question.prompt}</p>
      <ol class="step-list">
        <li><span>1</span><div><strong>Hiểu yêu cầu</strong><br>Đề đang yêu cầu tìm hoặc chọn một kết quả chính xác.</div></li>
        <li><span>2</span><div><strong>Cách suy nghĩ</strong><br>${escapeText(methodHint(question))}</div></li>
        <li><span>3</span><div><strong>Kiểm tra kết quả</strong><br>Đáp án: <b>${escapeText(question.answer)}</b>. ${escapeText(question.explanation)}</div></li>
      </ol>`;
  }

  function renderAnalysis() {
    if (!currentResults.length || !currentConfig) return;
    const correct = currentResults.filter(item => item.isCorrect).length;
    const unanswered = currentResults.filter(item => item.unanswered).length;
    const incorrect = currentResults.length - correct - unanswered;
    const wrongItems = currentResults.filter(item => !item.isCorrect);
    const subjectLabel = currentConfig.subject === "math" ? "Toán" : "Tiếng Việt";
    const focus = topicName(currentConfig.subject, currentConfig.grade, currentConfig.topic);
    const list = wrongItems.length
      ? `<ol class="wrong-list">${wrongItems.map(item => {
          const q = currentQuestions[item.index];
          return `<li>Câu ${item.index + 1}: ${escapeText(plainText(q.prompt).slice(0, 75))} — <strong>${item.unanswered ? "chưa trả lời" : "đã chọn " + escapeText(item.answer)}</strong>; đáp án ${escapeText(q.answer)}.</li>`;
        }).join("")}</ol>`
      : "<p><strong>Rất tốt!</strong> Chưa phát hiện câu sai trong lần làm này.</p>";
    const advice = wrongItems.length
      ? `Nên luyện lại ${focus} trong 10 phút, xem giải thích các câu ${wrongItems.map(item => item.index + 1).join(", ")} rồi tạo một bộ mới.`
      : `Có thể chuyển sang mức cao hơn hoặc chọn chủ đề khác của ${subjectLabel} lớp ${currentConfig.grade}.`;
    els.analysisOutput.className = "analysis-output empty-panel has-content";
    els.analysisOutput.innerHTML = `
      <div class="analysis-summary">
        <div><strong>${correct}</strong><small>Câu đúng</small></div>
        <div><strong>${incorrect}</strong><small>Câu sai</small></div>
        <div><strong>${unanswered}</strong><small>Bỏ trống</small></div>
      </div>
      ${list}<p class="recommendation"><strong>Gợi ý tiếp theo:</strong> ${escapeText(advice)}</p>`;
  }

  function buildSevenDayPlan() {
    const state = getState();
    const history = state.history || [];
    const weakest = history.length ? [...history].sort((a, b) => a.score - b.score)[0] : null;
    const prefs = currentConfig || state.preferences || {};
    const grade = weakest?.grade || prefs.grade || 2;
    const subject = weakest?.subject || prefs.subject || "math";
    const subjectLabel = subject === "math" ? "Toán" : "Tiếng Việt";
    const otherSubject = subject === "math" ? "Tiếng Việt" : "Toán";
    const focus = weakest?.topic || (prefs.topic ? topicName(subject, grade, prefs.topic) : `Tổng hợp ${subjectLabel} lớp ${grade}`);
    const days = [
      { title: `Ngày 1 · Ôn nền tảng ${focus}`, detail: "Làm 4–6 câu mức cơ bản, không bấm xem đáp án trước." },
      { title: `Ngày 2 · Luyện ${otherSubject} lớp ${grade}`, detail: "Làm một phiếu ngắn để giữ nhịp học cân bằng." },
      { title: `Ngày 3 · Sửa phần còn yếu`, detail: `Xem lại giải thích từng bước của chủ đề ${focus}.` },
      { title: `Ngày 4 · Làm lại lỗi sai`, detail: "Tự giải lại các câu từng sai, sau đó mới đối chiếu đáp án." },
      { title: `Ngày 5 · Tăng độ chắc`, detail: `Tạo bộ mới môn ${subjectLabel}, mức vừa sức, học 10–15 phút.` },
      { title: `Ngày 6 · Ôn tổng hợp lớp ${grade}`, detail: "Chọn chủ đề Tổng hợp và cố gắng hoàn thành không bỏ trống." },
      { title: `Ngày 7 · Kiểm tra tiến bộ`, detail: `Làm lại ${focus}; so sánh điểm với lần đầu tuần.` }
    ].map((day, index) => ({ ...day, id: index + 1, done: false }));
    state.plan = { createdAt: new Date().toISOString(), grade, focus, days };
    saveState(state);
    renderPlan();
  }

  function renderPlan() {
    const plan = getState().plan;
    if (!plan?.days?.length) {
      els.planEmpty.hidden = false;
      els.dayGrid.hidden = true;
      return;
    }
    els.planEmpty.hidden = true;
    els.dayGrid.hidden = false;
    els.dayGrid.innerHTML = "";
    plan.days.forEach(day => {
      const label = document.createElement("label");
      label.className = "day-card" + (day.done ? " done" : "");
      const input = document.createElement("input");
      input.type = "checkbox";
      input.checked = day.done;
      input.dataset.day = day.id;
      const text = document.createElement("span");
      text.innerHTML = `<strong>${escapeText(day.title)}</strong><small>${escapeText(day.detail)}</small>`;
      label.append(input, text);
      els.dayGrid.appendChild(label);
    });
  }

  function handleToolClick(tool) {
    if (tool === "math" || tool === "vietnamese") {
      els.subject.value = tool;
      updateTopics();
      updateAmountOptions();
      $("workspace").scrollIntoView({ behavior: "smooth" });
      setTimeout(() => els.grade.focus(), 500);
      return;
    }
    if (tool === "practice") {
      (currentQuestions.length ? els.paperSection : $("workspace")).scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (tool === "explain") {
      $("explain").scrollIntoView({ behavior: "smooth" });
      return;
    }
    if (tool === "analysis") {
      $("analysis").scrollIntoView({ behavior: "smooth" });
      return;
    }
    $("plan").scrollIntoView({ behavior: "smooth" });
  }

  function requestClear(allData) {
    const run = () => {
      const state = getState();
      if (allData) localStorage.removeItem(STORE_KEY);
      else {
        state.history = [];
        saveState(state);
      }
      renderHistory();
      renderPlan();
    };
    if (typeof els.confirmDialog.showModal === "function") {
      els.confirmDialog.dataset.mode = allData ? "all" : "history";
      els.confirmDialog.showModal();
    } else if (window.confirm("Bạn chắc chắn muốn xóa dữ liệu đã lưu?")) run();
  }

  function restorePreferences() {
    const prefs = getState().preferences || {};
    if (prefs.grade) els.grade.value = prefs.grade;
    if (prefs.subject) els.subject.value = prefs.subject;
    updateTopics(prefs.topic);
    if (prefs.level) els.level.value = prefs.level;
    if (prefs.student) els.studentName.value = prefs.student;
    if (prefs.role) {
      const radio = document.querySelector(`input[name="role"][value="${prefs.role}"]`);
      if (radio) radio.checked = true;
    }
    updateRole();
    if (prefs.amount && [...els.amount.options].some(option => option.value === String(prefs.amount))) {
      els.amount.value = prefs.amount;
    }
  }

  els.grade.addEventListener("change", () => updateTopics());
  els.subject.addEventListener("change", () => { updateTopics(); updateAmountOptions(); });
  document.querySelectorAll('input[name="role"]').forEach(input => input.addEventListener("change", updateRole));
  els.generateBtn.addEventListener("click", () => generate(true));
  els.newVersionBtn.addEventListener("click", () => generate(false));
  els.gradeBtn.addEventListener("click", gradeQuiz);
  els.answerBtn.addEventListener("click", toggleAnswers);
  els.explainBtn.addEventListener("click", renderExplanation);
  els.createPlanBtn.addEventListener("click", buildSevenDayPlan);
  els.dayGrid.addEventListener("change", event => {
    const input = event.target.closest("input[data-day]");
    if (!input) return;
    const state = getState();
    const day = state.plan?.days?.find(item => item.id === Number(input.dataset.day));
    if (day) { day.done = input.checked; saveState(state); renderPlan(); }
  });
  document.querySelectorAll("[data-tool]").forEach(button => button.addEventListener("click", () => handleToolClick(button.dataset.tool)));
  els.printBtn.addEventListener("click", () => window.print());
  els.clearHistoryBtn.addEventListener("click", () => requestClear(false));
  els.clearDataTop.addEventListener("click", () => requestClear(true));
  els.confirmDialog.addEventListener("close", () => {
    if (els.confirmDialog.returnValue !== "confirm") return;
    const allData = els.confirmDialog.dataset.mode === "all";
    const state = getState();
    if (allData) localStorage.removeItem(STORE_KEY);
    else { state.history = []; saveState(state); }
    renderHistory();
    renderPlan();
    if (allData) restorePreferences();
  });

  els.year.textContent = new Date().getFullYear();
  restorePreferences();
  renderHistory();
  renderPlan();
})();
