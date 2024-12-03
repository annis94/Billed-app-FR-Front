import VerticalLayout from "./VerticalLayout.js"; 
import ErrorPage from "./ErrorPage.js"; 
import LoadingPage from "./LoadingPage.js"; 
import Actions from "./Actions.js"; 

// Fonction pour générer une ligne de tableau pour une note de frais donnée
const row = (bill) => {
  return `
    <tr>
      <td>${bill.type}</td> <!-- Colonne Type -->
      <td>${bill.name}</td> <!-- Colonne Nom -->
      <td>${bill.date}</td> <!-- Colonne Date -->
      <td>${bill.amount} €</td> <!-- Colonne Montant -->
      <td>${bill.status}</td> <!-- Colonne Statut -->
      <td>
        ${Actions(bill.fileUrl)} <!-- Actions disponibles (par ex : voir justificatif) -->
      </td>
    </tr>
    `;
};

// Fonction pour générer toutes les lignes du tableau à partir des données
const rows = (data) => {
  return data && data.length ? data.map((bill) => row(bill)).join("") : ""; 
  // Si des données existent, on génère une ligne pour chaque note de frais. Sinon, rien n'est affiché.
};

// Exportation de la fonction principale pour afficher la page
export default ({ data: bills, loading, error }) => {
  // Fonction pour définir le modal utilisé pour afficher les justificatifs
  const modal = () => `
    <div class="modal fade" id="modaleFile" tabindex="-1" role="dialog" aria-labelledby="exampleModalCenterTitle" aria-hidden="true">
      <div class="modal-dialog modal-dialog-centered modal-lg" role="document">
        <div class="modal-content">
          <div class="modal-header">
            <h5 class="modal-title" id="exampleModalLongTitle">Justificatif</h5> <!-- Titre du modal -->
            <button type="button" class="close" data-dismiss="modal" aria-label="Close">
              <span aria-hidden="true">&times;</span> <!-- Bouton pour fermer le modal -->
            </button>
          </div>
          <div class="modal-body">
          </div> <!-- Contenu du modal (vide pour être rempli dynamiquement) -->
        </div>
      </div>
    </div>
  `;

  // Si la page est en train de charger, afficher la page de chargement
  if (loading) {
    return LoadingPage();
  } 
  // Si une erreur est survenue, afficher la page d'erreur
  else if (error) {
    return ErrorPage(error);
  }

  // Affichage principal de la page
  return `
    <div class='layout'>
      ${VerticalLayout(120)} <!-- Mise en page verticale avec un padding de 120 -->
      <div class='content'>
        <div class='content-header'>
          <div class='content-title'> Mes notes de frais </div> <!-- Titre principal -->
          <button type="button" data-testid='btn-new-bill' class="btn btn-primary">Nouvelle note de frais</button> <!-- Bouton pour créer une nouvelle note -->
        </div>
        <div id="data-table">
        <table id="example" class="table table-striped" style="width:100%"> <!-- Début du tableau -->
          <thead>
              <tr>
                <th>Type</th> <!-- En-tête Type -->
                <th>Nom</th> <!-- En-tête Nom -->
                <th>Date</th> <!-- En-tête Date -->
                <th>Montant</th> <!-- En-tête Montant -->
                <th>Statut</th> <!-- En-tête Statut -->
                <th>Actions</th> <!-- En-tête Actions -->
              </tr>
          </thead>
          <tbody data-testid="tbody"> <!-- Corps du tableau -->
${bills?.sort((a, b) => new Date(b.date) < new Date(a.date) ? 1 : -1).map(bill => row(bill))} 
<!-- Les notes de frais sont triées par date décroissante et chaque ligne est générée avec la fonction row -->
          </tbody>
          </table>
        </div>
      </div>
      ${modal()} <!-- Insertion du modal dans la page -->
    </div>`;
};  
