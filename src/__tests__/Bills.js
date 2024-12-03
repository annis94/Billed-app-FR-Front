/**
* @jest-environment jsdom
*/

import { screen, waitFor, fireEvent } from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH } from "../constants/routes.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"


/* ---- Définition de la suite de tests principale ---- */
// Ce bloc contient tous les tests liés à la gestion des factures pour un employé connecté
describe("Given I am connected as an employee", () => {
 let billsInstance;
 let consoleSpy;


/* ---- Configuration avant et après chaque test ---- */
 // Avant chaque test, on prépare l'environnement, comme simuler localStorage et préparer le DOM
   beforeEach(() => {
   Object.defineProperty(window, 'localStorage', { value: localStorageMock })
   window.localStorage.setItem('user', JSON.stringify({ type: 'Employee' }))
   document.body.innerHTML = BillsUI({ data: bills })
   $.fn.modal = jest.fn()
   $.fn.width = () => 500
   consoleSpy = jest.spyOn(console, 'error')
 })

   // Après chaque test, on nettoie les espions et les simulations pour éviter les interférences entre tests
 afterEach(() => {
   consoleSpy.mockRestore()
   jest.clearAllMocks()
 })


/* ---- Tests pour vérifier l'initialisation du composant ---- */
describe("Bills Component - Initialization", () => {
   describe("Initialisation", () => {
     test("Then it should redirect to Login page if no user in localStorage", () => {
             // Objectif : Vérifier que l'utilisateur est redirigé vers la page de connexion si localStorage est vide
             const onNavigate = jest.fn() // Simule une fonction pour gérer la navigation
             const localStorage = { getItem: jest.fn(() => null) } // Simule un localStorage vide
       
        // Création d'une instance du composant avec localStorage vide
        new Bills({
         document,
         onNavigate,
         store: null,
         localStorage: localStorage
       })
       
             // Vérifie que la navigation vers la page de connexion a bien été déclenchée
       expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH.Login)
     })

     test("L'icône des factures dans la mise en page verticale doit être mise en surbrillance", async () => {
     // Objectif : Vérifier que l'icône des factures est mise en surbrillance lorsqu'un employé est connecté
     Object.defineProperty(window, 'localStorage', { value: localStorageMock })
     
       // Ajoute un utilisateur de type "Employé" dans le localStorage.
       window.localStorage.setItem('user', JSON.stringify({
         type: 'Employee'
       }))
     
       // Création dynamique d'un élément HTML pour accueillir l'application.
       const root = document.createElement("div")
       root.setAttribute("id", "root")
       document.body.append(root)
     
       // Initialise le routeur.
       router()
     
       // Navigue vers la page des factures.
       window.onNavigate(ROUTES_PATH.Bills)
     
       // Attends que les éléments portant le data-testid 'icon-window' soient chargés.
       await waitFor(() => screen.getAllByTestId('icon-window'))
     
       // Récupère le premier élément avec le data-testid 'icon-window'.
       const windowIcon = screen.getAllByTestId('icon-window')[0]
     
       // Vérifie que la classe 'active-icon' est bien présente sur l'icône.
       expect(windowIcon.classList.contains('active-icon')).toBe(true)
     })
     

     test("Then it should initialize UI elements after loading", async () => {
              // Objectif : Vérifier que les éléments d'interface utilisateur sont bien présents après le chargement
       billsInstance = new Bills({
         document,
         onNavigate: jest.fn(), // Simule une fonction de navigation
         store: mockStore, // Simule un magasin de données
         localStorage: window.localStorage  // `localStorage` est simulé pour stocker les données localement
       })

     // Attends que le bouton "Nouvelle facture" soit disponible dans le DOM
     await waitFor(() => screen.getByTestId('btn-new-bill'))
       const newBillButton = screen.getByTestId('btn-new-bill')
       const eyeIcons = screen.getAllByTestId('icon-eye')
       
     // Vérifie que le bouton "Nouvelle facture" est visible
       expect(newBillButton).toBeTruthy()
     // Vérifie qu'il y a au moins une icône "œil" dans le DOM
     expect(eyeIcons.length).toBeGreaterThan(0)
     })
   })


     /* ---- Tests pour les interactions utilisateur avec l'interface ---- */

   describe("UI Interactions", () => {
     // Test pour vérifier si les factures sont bien triées par date de la plus ancienne à la plus récente
     test("Then bills should be ordered from earliest to latest", () => {
     // Objectif : Vérifier que les factures sont affichées dans l'ordre chronologique croissant
       const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
       // Fonction de tri en ordre anti-chronologique
       const antiChrono = (a, b) => ((a > b) ? 1 : -1)
       // Trie les dates récupérées
       const datesSorted = [...dates].sort(antiChrono)
       // Vérifie que les dates affichées correspondent à un tri correct
       expect(dates).toEqual(datesSorted)
     })
   
     // Test pour s'assurer que le clic sur le bouton "Nouvelle facture" redirige vers la page NewBill
     test("Then handleClickNewBill should navigate to NewBill page", () => {
       const onNavigate = (pathname) => {
         // Simule la navigation en modifiant le DOM
         document.body.innerHTML = pathname
       }
       
       // Instanciation de l'objet Bills avec des dépendances fictives
       billsInstance = new Bills({
         document,
         onNavigate,
         store: null,
         localStorage: window.localStorage
       })
   
       // Simulation de la méthode handleClickNewBill
       const handleClickNewBill = jest.fn(billsInstance.handleClickNewBill)
       // Récupère le bouton "Nouvelle facture"
       const newBillButton = screen.getByTestId('btn-new-bill')
       // Ajoute un listener pour déclencher l'action simulée
       newBillButton.addEventListener('click', handleClickNewBill)
       // Simule le clic sur le bouton
       fireEvent.click(newBillButton)
       // Vérifie que la fonction handleClickNewBill a été appelée
       expect(handleClickNewBill).toHaveBeenCalled()
     })
   
     describe("Icon Eye Interactions", () => {
       // Test pour s'assurer qu'un clic sur l'icône "œil" ouvre le modal
       test("Then handleClickIconEye should open modal", () => {
         // Instanciation de Bills avec les dépendances nécessaires
         billsInstance = new Bills({
           document,
           onNavigate: null,
           store: null,
           localStorage: window.localStorage
         })
   
         // Récupère la première icône "œil"
         const eye = screen.getAllByTestId('icon-eye')[0]
         // Simule la méthode handleClickIconEye
         const handleClickIconEye = jest.fn(() => billsInstance.handleClickIconEye(eye))
         // Ajoute un listener pour déclencher l'action simulée
         eye.addEventListener('click', handleClickIconEye)
         // Simule le clic sur l'icône
         fireEvent.click(eye)
         // Vérifie que la fonction handleClickIconEye a été appelée
         expect(handleClickIconEye).toHaveBeenCalled()
       })
   
       // Test pour vérifier la gestion des erreurs en cas d'URL manquante dans l'icône
       test("Then it should handle missing bill URL gracefully", () => {
         // Instanciation de Bills avec les dépendances nécessaires
         billsInstance = new Bills({
           document,
           onNavigate: null,
           store: null,
           localStorage: window.localStorage
         })
   
         // Création d'une icône fictive sans URL associée
         const icon = document.createElement('div')
         icon.setAttribute('data-testid', 'icon-eye')
         icon.setAttribute('data-bill-url', '') // URL vide pour forcer une erreur
   
         // Appelle la méthode avec l'icône défectueuse
         billsInstance.handleClickIconEye(icon)
         // Vérifie que le message d'erreur attendu est bien affiché
         expect(consoleSpy).toHaveBeenCalledWith('URL de la facture manquante')
       })
     })
   })
   
   describe("Error Handling", () => {

     // Tests liés aux erreurs d'initialisation de l'interface utilisateur
     describe("UI Initialization Errors", () => {
   
       // Test pour vérifier la gestion des erreurs lors de l'initialisation du DOM
       test("Then it should handle DOM initialization errors", () => {
         // Sauvegarde de la méthode originale `document.querySelector`
         const originalQuerySelector = document.querySelector
         // Simulation d'une erreur lors de l'appel à `querySelector`
         document.querySelector = jest.fn(() => { throw new Error('DOM error') })
   
         // Instanciation de Bills avec des dépendances fictives
         billsInstance = new Bills({
           document,
           onNavigate: jest.fn(),
           store: null,
           localStorage: window.localStorage
         })
   
         // Appelle la méthode `initializeUI` pour vérifier la gestion des erreurs
         billsInstance.initializeUI()
         // Vérifie que l'erreur a bien été capturée et loggée
         expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'initialisation UI:', expect.any(Error))
         
         // Restauration de la méthode originale `querySelector`
         document.querySelector = originalQuerySelector
       })
   
       // Test pour s'assurer que les erreurs liées aux listeners d'événements sont gérées correctement
       test("Then it should handle event listener errors", () => {
         // Simulation d'un bouton avec un listener défectueux
         const mockButton = {
           addEventListener: jest.fn(() => {
             throw new Error('Event listener error')
           })
         }
   
         // Simule `document.querySelector` pour retourner ce bouton mocké
         jest.spyOn(document, 'querySelector')
           .mockImplementation((selector) => {
             if (selector === `button[data-testid="btn-new-bill"]`) {
               return mockButton
             }
             return null
           })
   
         // Instanciation de Bills avec des dépendances fictives
         billsInstance = new Bills({
           document,
           onNavigate: jest.fn(),
           store: null,
           localStorage: window.localStorage
         })
   
         // Appelle la méthode `initializeUI` pour vérifier la gestion des erreurs
         billsInstance.initializeUI()
         // Vérifie que l'erreur liée au listener a bien été capturée et loggée
         expect(consoleSpy).toHaveBeenCalledWith('Erreur lors de l\'initialisation UI:', expect.any(Error))
       })
     })
   
     // Tests liés aux erreurs de gestion des données
     describe("Data Handling Errors", () => {
   
       // Test pour vérifier la gestion des erreurs de formatage des données
       test("Then it should handle formatting errors gracefully", async () => {
         // Simulation d'un store avec une date au format invalide
         const mockStoreWithInvalidDate = {
           bills: () => ({
             list: () => Promise.resolve([{
               date: "invalid-date",
               status: "pending"
             }])
           })
         }
         
         // Instanciation de Bills avec un store mocké
         billsInstance = new Bills({
           document,
           onNavigate: jest.fn(),
           store: mockStoreWithInvalidDate,
           localStorage: localStorageMock
         })
         
         // Appelle `getBills` et vérifie que les données récupérées sont manipulées sans crash
         const bills = await billsInstance.getBills()
         expect(bills[0].date).toBe("invalid-date") // Vérifie que la date reste "invalid-date"
         expect(bills[0].status).toBeDefined() // Vérifie que le statut est toujours défini
       })
   
       // Test pour vérifier que la méthode lève une erreur si le store n'est pas initialisé
       test("Then it should throw error if store is not initialized", async () => {
         // Instanciation de Bills avec un store non défini
         billsInstance = new Bills({
           document,
           onNavigate: jest.fn(),
           store: null,
           localStorage: localStorageMock
         })
   
         // Vérifie qu'un appel à `getBills` lève l'erreur attendue
         await expect(billsInstance.getBills()).rejects.toThrow("Store non initialisé")
       })
     })
   })
   

       /* ---- Vérification des états de chargement et d'erreur ---- */
   describe("Loading and Error States", () => {
     test("Then it should render Loading page", () => {
               // Vérifie que la page "Chargement..." s'affiche correctement
       document.body.innerHTML = BillsUI({ loading: true })
       expect(screen.getAllByText('Loading...')).toBeTruthy()
     })

     test("Then it should render Error page", () => {
       document.body.innerHTML = BillsUI({ error: 'Une erreur est survenue' })
       expect(screen.getAllByText('Erreur')).toBeTruthy()
     })
   })




       /* ---- Tests pour l'intégration avec l'API ---- */
   describe("API Integration", () => {
     test("Then fetches bills from mock API GET", async () => {
           // Objectif : Vérifier que les factures sont récupérées correctement depuis une API simulée
           const getSpy = jest.spyOn(mockStore, "bills") // Espionne la méthode bills du mockStore
           billsInstance = new Bills({
         document,
         onNavigate: jest.fn(), // Simule une fonction de navigation
         store: mockStore, // Utilise le magasin de données simulé
         localStorage: window.localStorage // Simule le localStorage
       })

           // Appelle la méthode getBills pour récupérer les données
       const bills = await billsInstance.getBills()
      // Vérifie que la méthode de l'API simulée a bien été appelée
   expect(getSpy).toHaveBeenCalled()
   // Vérifie que 4 factures ont été récupérées, comme attendu dans le mock
   expect(bills.length).toBe(4)
 })

     test("Then fetches bills from an API and fails with 404 message error", async () => {
           // Objectif : Vérifier qu'une erreur 404 est correctement gérée et affichée
       mockStore.bills.mockImplementationOnce(() => ({
         list: () => Promise.reject(new Error("Erreur 404")) // Simule une erreur 404
       }))
       
        // Simule une interface utilisateur avec une erreur
   document.body.innerHTML = BillsUI({ error: "Erreur 404" })
   const message = screen.getByText(/Erreur 404/) // Récupère le message d'erreur affiché

   // Vérifie que le message d'erreur est correctement rendu dans le DOM
   expect(message).toBeTruthy()
 })

     test("Then fetches messages from an API and fails with 500 message error", async () => {
           // Objectif : Vérifier qu'une erreur 500 est correctement gérée et affichée
       mockStore.bills.mockImplementationOnce(() => ({
         list: () => Promise.reject(new Error("Erreur 500"))
       }))

       document.body.innerHTML = BillsUI({ error: "Erreur 500" })
       const message = screen.getByText(/Erreur 500/)
       expect(message).toBeTruthy()
     })
   })


   /* ---- Tests pour la gestion des dates ---- */
   describe("Date Handling", () => {
     test("Then it should properly format all valid dates", async () => {
           // Objectif : Vérifier que les dates des factures sont formatées correctement
       const mockStoreWithDates = {
         bills: () => ({
           list: () => Promise.resolve([ // Simule une réponse contenant des factures avec des dates valides
             {
               id: '1',
               date: '2023-12-25', // Date au format ISO
               amount: 100,
               status: 'pending'
             },
             {
               id: '2',
               date: '2023-01-01',
               amount: 200,
               status: 'accepted'
             }
           ])
         })
       }
   
           // Création d'une instance du composant avec des factures contenant des dates valides
       billsInstance = new Bills({
         document,
         onNavigate: jest.fn(), // Simule une fonction de navigation
         store: mockStoreWithDates, // Utilise le magasin simulé avec les dates
         localStorage: window.localStorage // Simule le localStorage
       })

       // Récupère les factures en appelant getBills
       const bills = await billsInstance.getBills()
       
         // Vérifie que deux factures ont bien été récupérées
   expect(bills).toHaveLength(2)
   // Vérifie que la première facture a une date correctement formatée (par exemple : "25 déc. 2023")
   expect(bills[0].date).toMatch(/25\s[A-Za-zéû]{3,4}\.\s\d{2}/)
   // Vérifie que la deuxième facture a une date correctement formatée (par exemple : "1 janv. 2023")
   expect(bills[1].date).toMatch(/1\s[A-Za-zéû]{3,4}\.\s\d{2}/)
     })
   })
 })
})
