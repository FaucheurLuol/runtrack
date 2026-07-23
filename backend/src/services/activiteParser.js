const FitParser = require('fit-file-parser').default;
const xml2js    = require('xml2js');

// Parse un fichier .fit et extrait le résumé de la séance
function parseFit(buffer) {
    return new Promise((resolve, reject) => {
        const fitParser = new FitParser({
            force:            true,
            speedUnit:        'km/h',
            lengthUnit:       'km',
            temperatureUnit:  'celsius',
            elapsedRecordField: true,
            mode:             'list',
        });

        fitParser.parse(buffer, (error, data) => {
            if (error) return reject(error);

            const session = data.sessions?.[0];
            if (!session) return reject(new Error('Aucune session trouvée dans le fichier .fit'));

            const duree_sec       = Math.round(session.total_timer_time || session.total_elapsed_time || 0);
            const distance_km     = session.total_distance || 0;
            const fc_moyenne      = session.avg_heart_rate || null;
            const fc_max          = session.max_heart_rate || null;
            const cadence_moyenne = session.avg_cadence || null;
            const date            = session.start_time || new Date();

            resolve({
                duree_reelle:    duree_sec,
                distance_reelle: parseFloat(distance_km.toFixed(2)),
                fc_moyenne,
                fc_max,
                cadence_moyenne,
                date_realisee:   date,
            });
        });
    });
}

// Parse un fichier .gpx et calcule le résumé depuis les points GPS
async function parseGpx(buffer) {
    const parser = new xml2js.Parser();
    const result = await parser.parseStringPromise(buffer.toString());

    const trk = result.gpx?.trk?.[0];
    if (!trk) throw new Error('Aucune trace trouvée dans le fichier .gpx');

    const points = trk.trkseg?.[0]?.trkpt || [];
    if (points.length === 0) throw new Error('Aucun point GPS trouvé');

    // Distance totale via formule de Haversine entre points consécutifs
    let distance_km = 0;
    const R = 6371; // rayon terrestre en km

    for (let i = 1; i < points.length; i++) {
        const lat1 = parseFloat(points[i - 1].$.lat);
        const lon1 = parseFloat(points[i - 1].$.lon);
        const lat2 = parseFloat(points[i].$.lat);
        const lon2 = parseFloat(points[i].$.lon);

        const dLat = (lat2 - lat1) * Math.PI / 180;
        const dLon = (lon2 - lon1) * Math.PI / 180;
        const a = Math.sin(dLat/2) ** 2 +
                  Math.cos(lat1 * Math.PI/180) * Math.cos(lat2 * Math.PI/180) *
                  Math.sin(dLon/2) ** 2;
        const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1-a));
        distance_km += R * c;
    }

    // Durée depuis le premier et dernier timestamp
    const premierPoint = points[0];
    const dernierPoint = points[points.length - 1];
    const dateDebut = new Date(premierPoint.time?.[0]);
    const dateFin   = new Date(dernierPoint.time?.[0]);
    const duree_sec = Math.round((dateFin - dateDebut) / 1000);

    // Fréquence cardiaque si présente (extension Garmin TrackPointExtension)
    let fcValeurs = [];
    points.forEach(p => {
        const ext = p.extensions?.[0]?.['gpxtpx:TrackPointExtension']?.[0];
        const hr  = ext?.['gpxtpx:hr']?.[0];
        if (hr) fcValeurs.push(parseInt(hr));
    });

    const fc_moyenne = fcValeurs.length > 0
        ? Math.round(fcValeurs.reduce((a, b) => a + b, 0) / fcValeurs.length)
        : null;
    const fc_max = fcValeurs.length > 0 ? Math.max(...fcValeurs) : null;

    return {
        duree_reelle:    duree_sec,
        distance_reelle: parseFloat(distance_km.toFixed(2)),
        fc_moyenne,
        fc_max,
        cadence_moyenne: null, // Rarement présent dans les .gpx standards
        date_realisee:   dateDebut,
    };
}

module.exports = { parseFit, parseGpx };