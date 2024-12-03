// Importation des chemins de routage, des outils de formatage et du module de déconnexion
import { ROUTES_PATH } from "../constants/routes.js";
import { formatDate, formatStatus } from "../app/format.js";
import Logout from "./Logout.js";

// Classe principale pour gérer l'interface des factures
export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    console.log("1. Initialisation Bills :", {
      localStorage: localStorage.getItem("user"),
      store: store ? "Store présent" : "Store absent",
    });

    // Initialisation des propriétés nécessaires
    this.document = document;
    this.onNavigate = onNavigate;
    this.store = store;
    this.localStorage = localStorage;

    // Vérification de l'authentification de l'utilisateur
    const user = JSON.parse(localStorage.getItem("user"));
    if (!user) {
      console.error("Utilisateur non connecté");
      this.onNavigate(ROUTES_PATH["Login"]);
      return;
    }

    // Démarre l'initialisation après le chargement du DOM
    setTimeout(() => {
      this.initializeUI();
    }, 100);

    // Instanciation du composant Logout
    new Logout({ document, localStorage, onNavigate });
  }

  // Configuration des éléments interactifs de l'interface
  initializeUI = () => {
    try {
      const buttonNewBill = this.document.querySelector(
        `button[data-testid="btn-new-bill"]`
      );
      if (buttonNewBill) {
        buttonNewBill.addEventListener("click", this.handleClickNewBill);
      }

      const iconEye = this.document.querySelectorAll(
        `div[data-testid="icon-eye"]`
      );
      iconEye.forEach((icon) => {
        icon.addEventListener("click", () => this.handleClickIconEye(icon));
      });
    } catch (error) {
      console.error("Erreur lors de l'initialisation UI:", error);
    }
  };

  // Redirection vers le formulaire de création de nouvelle facture
  handleClickNewBill = (e) => {
    if (e) e.preventDefault();
    this.onNavigate(ROUTES_PATH["NewBill"]); 
  };

  // Gestion de l'affichage du justificatif via le modal
  handleClickIconEye = (icon) => {
    try {
      const billUrl = icon.getAttribute("data-bill-url");
      if (!billUrl) {
        console.error("URL de la facture manquante");
        return;
      }
      const imgWidth = Math.floor($("#modaleFile").width() * 0.5);
      $("#modaleFile")
        .find(".modal-body")
        .html(
          `<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`
        );
      $("#modaleFile").modal("show");
    } catch (error) {
      console.error("Erreur lors de l'affichage de la facture:", error);
    }
  };

  // Récupération des factures à partir du store
  getBills = async () => {
    try {
      console.log("4. Début getBills");
      if (!this.store) throw new Error("Store non initialisé");

      const snapshot = await this.store.bills().list();
      console.log("5. Données reçues:", snapshot);

      // Formatage des données reçues
      const bills = snapshot.map((doc) => {
        try {
          return {
            ...doc,
            date: formatDate(doc.date),
            status: formatStatus(doc.status),
          };
        } catch (e) {
          console.error("6. Erreur de formatage:", e, "pour", doc);
          return {
            ...doc,
            date: doc.date,
            status: formatStatus(doc.status),
          };
        }
      });
      console.log("7. Bills transformées:", bills);
      return bills;
    } catch (error) {
      console.error("Erreur lors de la récupération des factures:", error);
      throw error;
    }
  };
}
