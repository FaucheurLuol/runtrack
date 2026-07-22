export function telechargerCsv(nomFichier, lignes) {
    if (!lignes || lignes.length === 0) return;

    const entetes = Object.keys(lignes[0]);
    const echapper = (valeur) => {
        const str = String(valeur ?? '');
        if (str.includes(',') || str.includes('"') || str.includes('\n')) {
            return `"${str.replace(/"/g, '""')}"`;
        }
        return str;
    };

    const contenu = [
        entetes.join(','),
        ...lignes.map(ligne => entetes.map(cle => echapper(ligne[cle])).join(',')),
    ].join('\n');

    // BOM UTF-8 pour qu'Excel affiche correctement les accents
    const blob = new Blob(['\uFEFF' + contenu], { type: 'text/csv;charset=utf-8;' });
    const url  = URL.createObjectURL(blob);

    const lien = document.createElement('a');
    lien.href = url;
    lien.download = nomFichier;
    document.body.appendChild(lien);
    lien.click();
    document.body.removeChild(lien);
    URL.revokeObjectURL(url);
}