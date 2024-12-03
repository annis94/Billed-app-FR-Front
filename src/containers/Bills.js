import { ROUTES_PATH } from '../constants/routes.js'
import { formatDate, formatStatus } from "../app/format.js"
import Logout from "./Logout.js"


export default class {
  constructor({ document, onNavigate, store, localStorage }) {
    console.log('1. Initialisation Bills :', {
      localStorage: localStorage.getItem('user'),
      store: store ? 'Store présent' : 'Store absent'
    })


    this.document = document
    this.onNavigate = onNavigate
    this.store = store
    this.localStorage = localStorage


    // Vérification de l'authentification
    const user = JSON.parse(localStorage.getItem('user'))
    if (!user) {
      console.error('Utilisateur non connecté')
      this.onNavigate(ROUTES_PATH['Login'])
      return
    }


    // Initialisation après un court délai pour s'assurer que le DOM est chargé
    setTimeout(() => {
      this.initializeUI()
    }, 100)


    new Logout({ document, localStorage, onNavigate })
  }


  initializeUI = () => {
    try {
      const buttonNewBill = this.document.querySelector(`button[data-testid="btn-new-bill"]`)
      if (buttonNewBill) {
        console.log('2. Bouton nouvelle facture trouvé')
        buttonNewBill.addEventListener('click', this.handleClickNewBill)
      }


      const iconEye = this.document.querySelectorAll(`div[data-testid="icon-eye"]`)
      if (iconEye.length > 0) {
        console.log('3. Icônes œil trouvées:', iconEye.length)
        iconEye.forEach(icon => {
          icon.addEventListener('click', () => this.handleClickIconEye(icon))
        })
      }
    } catch (error) {
      console.error('Erreur lors de l\'initialisation UI:', error)
    }
  }


  handleClickNewBill = (e) => {
    if (e) e.preventDefault()
    this.onNavigate(ROUTES_PATH['NewBill'])
  }


  handleClickIconEye = (icon) => {
    try {
      const billUrl = icon.getAttribute("data-bill-url")
      if (!billUrl) {
        console.error('URL de la facture manquante')
        return
      }
      const imgWidth = Math.floor($('#modaleFile').width() * 0.5)
      $('#modaleFile').find(".modal-body").html(`<div style='text-align: center;' class="bill-proof-container"><img width=${imgWidth} src=${billUrl} alt="Bill" /></div>`)
      $('#modaleFile').modal('show')
    } catch (error) {
      console.error('Erreur lors de l\'affichage de la facture:', error)
    }
  }


  getBills = async () => {
    try {
      console.log('4. Début getBills')
      if (!this.store) throw new Error('Store non initialisé')


      const snapshot = await this.store.bills().list()
      console.log('5. Données reçues:', snapshot)


      const bills = snapshot.map(doc => {
        try {
          return {
            ...doc,
            date: formatDate(doc.date),
            status: formatStatus(doc.status)
          }
        } catch(e) {
          console.error('6. Erreur de formatage:', e, 'pour', doc)
          return {
            ...doc,
            date: doc.date,
            status: formatStatus(doc.status)
          }
        }
      })
      console.log('7. Bills transformées:', bills)
      return bills
    } catch (error) {
      console.error('Erreur lors de la récupération des factures:', error)
      throw error
    }
  }
}

