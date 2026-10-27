// Vercel 서버리스 함수: API Key는 Vercel 환경변수(PIXABAY_API_KEY)에서만 읽는다.
module.exports = async (req, res) => {
  const key = process.env.PIXABAY_API_KEY;
  const q = String(req.query.q || '').trim();

  if (!key) {
    return res.status(500).json({ error: 'PIXABAY_API_KEY 환경변수가 설정되지 않았습니다.' });
  }
  if (!q) {
    return res.status(400).json({ error: '검색어를 입력해 주세요.' });
  }

  const url = `https://pixabay.com/api/?key=${encodeURIComponent(key)}&q=${encodeURIComponent(q)}&image_type=photo&per_page=30&safesearch=true`;
  try {
    const r = await fetch(url);
    if (!r.ok) {
      return res.status(r.status).json({ error: `Pixabay 요청 실패 (${r.status})` });
    }
    const data = await r.json();
    const hits = data.hits.map(h => ({ webformatURL: h.webformatURL, tags: h.tags }));
    res.setHeader('Cache-Control', 's-maxage=3600');
    return res.status(200).json({ hits });
  } catch (e) {
    return res.status(500).json({ error: '서버 오류가 발생했습니다.' });
  }
};
