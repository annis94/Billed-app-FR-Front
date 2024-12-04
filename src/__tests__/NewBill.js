 /**
 * @jest-environment jsdom
 */

import { screen, fireEvent, waitFor } from "@testing-library/dom";
import NewBillUI from "../views/NewBillUI.js";
import NewBill from "../containers/NewBill.js";
import { localStorageMock } from "../__mocks__/localStorage.js";
import { ROUTES, ROUTES_PATH } from "../constants/routes.js";
import store from "../__mocks__/store";

/* ---- tests pour la page "Nouvelle Facture" ---- */
describe("Given I am connected as an employee", () => {
  // Ce test vérifie le comportement lorsque l'utilisateur est sur la page "Nouvelle Facture"
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      // Configuration avant chaque test : Simule localStorage avec un utilisateur de type "Employé"
      Object.defineProperty(window, "localStorage", {
        value: localStorageMock,
      });
      window.localStorage.setItem(
        "user",
        JSON.stringify({
          type: "Employee",
          email: "employee@test.com",
        })
      );
    });

   test("Then the new bill form should be rendered", () => {
      // Vérifie que le formulaire de création de facture est affiché
      const html = NewBillUI(); // Génère le HTML de la page
      document.body.innerHTML = html;

            // Vérifie la présence du formulaire et du champ de fichier
      expect(screen.getByTestId("form-new-bill")).toBeTruthy();
      expect(screen.getByTestId("file")).toBeTruthy();
    });


        /* ---- Tests pour la gestion du téléchargement de fichier ---- */
    describe("When I upload a file", () => {
      test("Then it should handle a valid file (jpg)", async () => {
              // Objectif : Vérifier que le composant accepte et traite correctement un fichier valide (format jpg)
        const html = NewBillUI();
        document.body.innerHTML = html;

                // Simule une API avec une réponse réussie pour l'upload de fichier
                const createMock = jest.fn().mockResolvedValue({ fileUrl: "url", key: "1234" });
                  const updateMock = jest.fn().mockResolvedValue({});
                  const mockStore = {
                    bills: () => ({
                      create: createMock,
                      update: updateMock
                    }),
                  };

        const newBill = new NewBill({
          document,
          onNavigate: (pathname) =>
            (document.body.innerHTML = ROUTES({ pathname })),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file"); // Champ pour télécharger un fichier
        const handleChangeFile = jest.fn(newBill.handleChangeFile); // Simule la gestion de l'événement
        fileInput.addEventListener("change", handleChangeFile);

                // Simule le téléchargement d'un fichier jpg
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["image"], "test.jpg", { type: "image/jpeg" })],
          },
        });

        await waitFor(() => expect(createMock).toHaveBeenCalled());


                // Vérifie que la méthode handleChangeFile est bien appelée
        expect(handleChangeFile).toHaveBeenCalled();
        expect(fileInput.files[0].name).toBe("test.jpg");

                // Attends que l'upload du fichier soit terminé
        await waitFor(() => expect(newBill.fileUrl).toBe("url"));
      });

      test("Then it should reject an invalid file type", () => {
              // Objectif : Vérifier que le composant rejette les fichiers avec un format non supporté
        const html = NewBillUI();
        document.body.innerHTML = html;


                // Simule une API fictive pour tester le composant
                const mockStore = {
                  bills: () => ({
                    create: jest.fn().mockResolvedValue({ fileUrl: "url", key: "1234" }),
                    update: jest.fn().mockResolvedValue({})
                  }),
                };

        const newBill = new NewBill({
          document,
          onNavigate: (pathname) =>
            (document.body.innerHTML = ROUTES({ pathname })),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file");
        const handleChangeFile = jest.fn(newBill.handleChangeFile);
        fileInput.addEventListener("change", handleChangeFile);

        jest.spyOn(window, "alert").mockImplementation(() => {}); // Simule un message d'alerte


                // Simule le téléchargement d'un fichier texte (format non supporté)
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["text"], "test.txt", { type: "text/plain" })],
          },
        });

                // Vérifie que la méthode handleChangeFile est bien appelée
        expect(handleChangeFile).toHaveBeenCalled();

                // Vérifie que le message d'erreur est affiché et que l'input est réinitialisé
        expect(window.alert).toHaveBeenCalledWith(
          "Seuls les fichiers jpg, jpeg et png sont acceptés"
        );
        expect(fileInput.value).toBe("");
      });

      test("Then it should handle API error on file upload", async () => {
        // Objectif : Vérifier que les erreurs API lors de l'upload de fichier sont bien gérées
        const html = NewBillUI();
        document.body.innerHTML = html;

                // Simule une API avec une erreur
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockRejectedValue(new Error("Erreur API")),
            update: jest.fn().mockResolvedValue({})
          }),
        };

        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const consoleSpy = jest.spyOn(console, "error"); // Espionne les erreurs dans la console
        const fileInput = screen.getByTestId("file");


                // Simule un téléchargement de fichier jpg
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["image"], "test.jpg", { type: "image/jpeg" })],
          },
        });

        await waitFor(() => expect(consoleSpy).toHaveBeenCalled());
      });
    });


        /* ---- Tests pour la soumission du formulaire ---- */
    describe("When I submit the form", () => {
      test("Then it should submit the bill and redirect to Bills", async () => {
                // Objectif : Vérifier que le formulaire est soumis correctement et redirige l'utilisateur
        const html = NewBillUI();
        document.body.innerHTML = html;

        const mockStore = {
          bills: () => ({
            update: jest.fn().mockResolvedValue({}),
          }),
        };

        const onNavigate = jest.fn(); // Simule une fonction de navigation
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });

        // Définit les données nécessaires pour soumettre le formulaire
        newBill.fileUrl = "url";
        newBill.fileName = "test.jpg";

        const form = screen.getByTestId("form-new-bill"); // Sélectionne le formulaire
        fireEvent.submit(form); // Simule la soumission du formulaire

                // Vérifie que l'utilisateur est redirigé vers la page des factures
        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH["Bills"]);
      });
    });


    /* ---- Test d'intégration pour la création de factures ---- */
    describe("When I submit a new bill (Integration)", () => {
      test("Then the bill should be created in API", async () => {
              // Vérifie que la facture est créée dans l'API lors de la soumission
        const html = NewBillUI();
        document.body.innerHTML = html;

        const createMock = jest
          .fn()
          .mockResolvedValue({ fileUrl: "url", key: "123" });
        const updateMock = jest.fn().mockResolvedValue({});
        const mockStore = {
          bills: () => ({
            create: createMock,
            update: updateMock,
          }),
        };

        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file");
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["image"], "test.jpg", { type: "image/jpeg" })],
          },
        });

        await waitFor(() => expect(createMock).toHaveBeenCalled()); // Vérifie que l'API create est appelée

        const form = screen.getByTestId("form-new-bill");
        fireEvent.submit(form); // Soumet le formulaire

        await waitFor(() => expect(updateMock).toHaveBeenCalled());
      });

      test("Then it should handle API errors", async () => {
          // Objectif : Vérifier que les erreurs renvoyées par l'API lors de l'upload ou de la mise à jour sont correctement gérées
        const html = NewBillUI();
        document.body.innerHTML = html;

        const consoleSpy = jest.spyOn(console, "error");
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockRejectedValue(new Error("Erreur API")),
            update: jest.fn().mockRejectedValue(new Error("Erreur API")),
          }),
        };

        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage,
        });

        const fileInput = screen.getByTestId("file");
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["image"], "test.jpg", { type: "image/jpeg" })],
          },
        });

        await waitFor(() => expect(consoleSpy).toHaveBeenCalled()); // Vérifie que les erreurs sont loguées

          // Résultat attendu : la méthode console.error doit être appelée, signalant que l'erreur de l'API a été capturée
      });

      test("Then the API should receive the correct data for the new bill", async () => {
        const html = NewBillUI();
        document.body.innerHTML = html;
      
        const createMock = jest.fn().mockResolvedValue({ fileUrl: "url", key: "123" });
        const updateMock = jest.fn().mockResolvedValue({});
        const mockStore = {
          bills: () => ({
            create: createMock,
            update: updateMock
          }),
        };
      
        const onNavigate = jest.fn();
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage,
        });
      
        // Upload fichier
        const fileInput = screen.getByTestId("file");
        fireEvent.change(fileInput, {
          target: {
            files: [new File(["test"], "test.jpg", { type: "image/jpeg" })]
          }
        });
      
        await waitFor(() => {
          expect(createMock).toHaveBeenCalledWith(expect.objectContaining({
            data: expect.any(FormData)
          }));
        });
      
        // Remplir formulaire
        const form = screen.getByTestId("form-new-bill");
        fireEvent.change(screen.getByTestId("expense-type"), { target: { value: "Transports" }});
        fireEvent.change(screen.getByTestId("expense-name"), { target: { value: "Taxi" }});
        fireEvent.change(screen.getByTestId("amount"), { target: { value: "50" }});
        fireEvent.change(screen.getByTestId("datepicker"), { target: { value: "2023-12-01" }});
        fireEvent.change(screen.getByTestId("vat"), { target: { value: "20" }});
        fireEvent.change(screen.getByTestId("pct"), { target: { value: "10" }});
        fireEvent.change(screen.getByTestId("commentary"), { target: { value: "Trajet professionnel" }});
      
        // Soumettre formulaire
        fireEvent.submit(form);
      
        // Vérifier l'appel à update
        await waitFor(() => {
          expect(updateMock).toHaveBeenCalled();
        });
      });

    });
  });
});  
