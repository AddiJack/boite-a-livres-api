export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { titre, auteur, pages, genre, couverture, notionToken, notionDbId } = req.body;

  if (!titre) return res.status(400).json({ error: 'Le titre est obligatoire' });
  if (!notionToken || !notionDbId) return res.status(400).json({ error: 'Token et Database ID requis' });
export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const { titre, auteur, pages, genre, couverture, notionToken, notionDbId } = req.body;

  if (!titre) return res.status(400).json({ error: 'Le titre est obligatoire' });
  if (!notionToken || !notionDbId) return res.status(400).json({ error: 'Token et Database ID requis' });

  // Validate token format
  if (!notionToken.startsWith('secret_') && !notionToken.startsWith('ntn_')) {
    return res.status(400).json({ error: 'Token Notion invalide' });
  }

  // Clean database ID (remove dashes, extract from URL if needed)
  let dbId = notionDbId.trim();
  const urlMatch = dbId.match(/([a-f0-9]{32})(?:[?&]|$)/i);
  if (urlMatch) dbId = urlMatch[1];
  dbId = dbId.replace(/-/g, '').toLowerCase();

  if (dbId.length !== 32) {
    return res.status(400).json({ error: 'Database ID invalide (doit faire 32 caractères)' });
  }

  try {
    const properties = {
      Titre: { title: [{ text: { content: titre } }] },
      État: { status: { name: 'À lire' } },
    };

    if (auteur) properties['Auteur'] = { rich_text: [{ text: { content: auteur } }] };
    if (pages && !isNaN(parseInt(pages))) properties['Pages totales'] = { number: parseInt(pages) };

    const genreOptions = [
      '💖 Romance', '🐉 Fantaisie', '🚀 Science-Fiction', '🔪 Thrillers',
      '🚨 Policiers', '🎨 BD / Manga / Roman graphique', '🎭 Classiques',
      '🛠️ Bureautique & Tech', '🖼️ Design & Graphisme', '💡 Entrepreneuriat & Business',
      '🏫 Pédagogie & Formation', '📈 Productivité & Organisation', '📢 Marketing & Vente',
      '✈️ Voyage & Aventure', '🌍 Histoire & Société', '🧘Bien-être',
      '✍️ Biographie & Témoignage', '🧠 Développement Personnel'
    ];
    if (genre && genreOptions.includes(genre)) properties['Genre'] = { select: { name: genre } };
    if (couverture) properties['Couverture'] = { url: couverture };

    const body = { parent: { database_id: dbId }, properties };
    if (couverture) body.cover = { type: 'external', external: { url: couverture } };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });

    const data = await notionRes.json();

    if (!notionRes.ok) {
      return res.status(500).json({ error: 'Erreur Notion API', details: data.message });
    }

    return res.status(200).json({ success: true, message: `"${titre}" ajouté !`, url: data.url });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
}

  // Validate token format
  if (!notionToken.startsWith('secret_') && !notionToken.startsWith('ntn_')) {
    return res.status(400).json({ error: 'Token Notion invalide' });
  }

  // Clean database ID (remove dashes, extract from URL if needed)
  let dbId = notionDbId.trim();
  const urlMatch = dbId.match(/([a-f0-9]{32})(?:[?&]|$)/i);
  if (urlMatch) dbId = urlMatch[1];
  dbId = dbId.replace(/-/g, '').toLowerCase();

  if (dbId.length !== 32) {
    return res.status(400).json({ error: 'Database ID invalide (doit faire 32 caractères)' });
  }

  try {
    const properties = {
      Titre: { title: [{ text: { content: titre } }] },
      État: { status: { name: 'À lire' } },
    };

    if (auteur) properties['Auteur'] = { rich_text: [{ text: { content: auteur } }] };
    if (pages && !isNaN(parseInt(pages))) properties['Pages totales'] = { number: parseInt(pages) };

    const genreOptions = [
      '💖 Romance', '🐉 Fantaisie', '🚀 Science-Fiction', '🔪 Thrillers',
      '🚨 Policiers', '🎨 BD / Manga / Roman graphique', '🎭 Classiques',
      '🛠️ Bureautique & Tech', '🖼️ Design & Graphisme', '💡 Entrepreneuriat & Business',
      '🏫 Pédagogie & Formation', '📈 Productivité & Organisation', '📢 Marketing & Vente',
      '✈️ Voyage & Aventure', '🌍 Histoire & Société', '🧘Bien-être',
      '✍️ Biographie & Témoignage', '🧠 Développement Personnel'
    ];
    if (genre && genreOptions.includes(genre)) properties['Genre'] = { select: { name: genre } };
    if (couverture) properties['Couverture'] = { url: couverture };

    const body = { parent: { database_id: dbId }, properties };
    if (couverture) body.cover = { type: 'external', external: { url: couverture } };

    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${notionToken}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });

    const data = await notionRes.json();

    if (!notionRes.ok) {
      return res.status(500).json({ error: 'Erreur Notion API', details: data.message });
    }

    return res.status(200).json({ success: true, message: `"${titre}" ajouté !`, url: data.url });

  } catch (err) {
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
}
