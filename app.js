const DATA_FILES = {
  records: 'data/records.txt',
  papers: 'data/papers.txt',
  partners: 'data/partners.txt',
};

async function loadTextFile(filePath) {
  const response = await fetch(filePath, { cache: 'no-store' });
  if (!response.ok) throw new Error(`${filePath}를 불러오지 못했습니다.`);
  return response.text();
}

function parseRecordLine(line) {
  const match = line.trim().match(/^([0-9]+):\{([^:]+):(\d+),(\d+),(\d+):(\d+)\}$/);
  if (!match) return null;
  const [, examNumber, name, background, operation, military, round] = match;
  return { examNumber, name, background: Number(background), operation: Number(operation), military: Number(military), round: Number(round) };
}

function parseLinkLine(line) {
  const separator = line.trim().indexOf(' - ');
  if (separator === -1) return null;
  return { title: line.trim().slice(0, separator), url: line.trim().slice(separator + 3) };
}

function renderRecordResult(record) {
  const resultBox = document.getElementById('record-result');
  if (!record) {
    resultBox.textContent = '조회 결과가 없습니다.';
    resultBox.classList.add('empty');
    return;
  }
  resultBox.classList.remove('empty');
  resultBox.innerHTML = `<div class="record-card"><div class="record-header"><h3>${record.name}</h3><span class="exam-badge">수험번호 ${record.examNumber}</span></div><ul class="score-list"><li>배경지식: ${record.background}점</li><li>운영: ${record.operation}점</li><li>군사: ${record.military}점</li></ul><p class="round-note">제 ${record.round}회 VNAT 시험 성적</p></div>`;
}

async function initializeRecords() {
  try {
    const records = (await loadTextFile(DATA_FILES.records)).split(/\r?\n/).map(parseRecordLine).filter(Boolean);
    document.getElementById('search-record').addEventListener('click', () => {
      const query = document.getElementById('exam-no').value.trim();
      renderRecordResult(records.find((record) => record.examNumber === query) || null);
    });
    renderRecordResult(records[0] || null);
  } catch (error) {
    renderRecordResult(null);
  }
}

async function renderLinkList(listId, filePath) {
  const list = document.getElementById(listId);
  try {
    const items = (await loadTextFile(filePath)).split(/\r?\n/).map(parseLinkLine).filter(Boolean);
    list.innerHTML = items.length ? items.map((item) => `<li><a href="${item.url}" target="_blank" rel="noopener noreferrer">${item.title}</a></li>`).join('') : '<li>등록된 항목이 없습니다.</li>';
  } catch (error) {
    list.innerHTML = '<li>자료를 불러오지 못했습니다.</li>';
  }
}

document.addEventListener('DOMContentLoaded', async () => {
  await initializeRecords();
  await Promise.all([
    renderLinkList('papers-list', DATA_FILES.papers),
    renderLinkList('partners-list', DATA_FILES.partners),
  ]);
});
