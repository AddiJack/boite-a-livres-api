export default async function handler(req, res) {
  // CORS headers — required for the GitHub Pages HTML to call this API
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');

  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  const NOTION_TOKEN = process.env.NOTION_TOKEN;
  const NOTION_DATABASE_ID = process.env.NOTION_DATABASE_ID;

  if (!NOTION_TOKEN || !NOTION_DATABASE_ID) {
    return res.status(500).json({ error: 'Missing environment variables' });
  }

  const { titre, auteur, pages, genre, couverture, isbn } = req.body;

  if (!titre) return res.status(400).json({ error: 'Le titre est obligatoire' });

  try {
    // Build Notion page properties
    const properties = {
      Titre: {
        title: [{ text: { content: titre } }]
      },
      État: {
        status: { name: 'À lire' }
      }
    };

    if (auteur) {
      properties['Auteur'] = { rich_text: [{ text: { content: auteur } }] };
    }

    if (pages && !isNaN(parseInt(pages))) {
      properties['Pages totales'] = { number: parseInt(pages) };
    }

    // Map genre string to Notion select option
    const genreOptions = [
      '💖 Romance', '🐉 Fantaisie', '🚀 Science-Fiction', '🔪 Thrillers',
      '🚨 Policiers', '🎨 BD / Manga / Roman graphique', '🎭 Classiques',
      '🛠️ Bureautique & Tech', '🖼️ Design & Graphisme', '💡 Entrepreneuriat & Business',
      '🏫 Pédagogie & Formation', '📈 Productivité & Organisation', '📢 Marketing & Vente',
      '✈️ Voyage & Aventure', '🌍 Histoire & Société', '🧘Bien-être',
      '✍️ Biographie & Témoignage', '🧠 Développement Personnel'
    ];

    if (genre && genreOptions.includes(genre)) {
      properties['Genre'] = { select: { name: genre } };
    }

    // Build the page body
    // ✅ Couverture en type URL dans la propriété
    if (couverture) {
      properties['Couverture'] = { url: couverture };
    }

    const body = {
      parent: { database_id: NOTION_DATABASE_ID },
      properties,
    };

    // Cover de page en bonus (image en haut de la fiche du livre)
    if (couverture) {
      body.cover = { type: 'external', external: { url: couverture } };
    }

    // Call Notion API
    const notionRes = await fetch('https://api.notion.com/v1/pages', {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${NOTION_TOKEN}`,
        'Content-Type': 'application/json',
        'Notion-Version': '2022-06-28',
      },
      body: JSON.stringify(body),
    });

    const notionData = await notionRes.json();

    if (!notionRes.ok) {
      console.error('Notion API error:', notionData);
      return res.status(500).json({ error: 'Erreur Notion API', details: notionData.message });
    }

    return res.status(200).json({
      success: true,
      message: `"${titre}" ajouté à ta bibliothèque !`,
      url: notionData.url,
    });

  } catch (err) {
    console.error('Server error:', err);
    return res.status(500).json({ error: 'Erreur serveur', details: err.message });
  }
}
