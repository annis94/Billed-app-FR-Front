/**
 * @jest-environment jsdom
 */
import { screen, fireEvent, waitFor } from "@testing-library/dom"
import NewBillUI from "../views/NewBillUI.js"
import NewBill from "../containers/NewBill.js"
import { localStorageMock } from "../__mocks__/localStorage.js"
import { ROUTES, ROUTES_PATH } from "../constants/routes.js"
import store from "../__mocks__/store"


describe("Given I am connected as an employee", () => {
  describe("When I am on NewBill Page", () => {
    beforeEach(() => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee',
        email: 'employee@test.com'
      }))
    })


    test("Then the new bill form should be rendered", () => {
      const html = NewBillUI()
      document.body.innerHTML = html
      expect(screen.getByTestId("form-new-bill")).toBeTruthy()
      expect(screen.getByTestId("file")).toBeTruthy()
    })


    describe("When I upload a file", () => {
      test("Then it should handle a valid file (jpg)", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({ fileUrl: 'url', key: '1234' })
          })
        }


        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
          store: mockStore,
          localStorage: window.localStorage
        })


        const fileInput = screen.getByTestId("file")
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        fileInput.addEventListener("change", handleChangeFile)


        fireEvent.change(fileInput, {
          target: {
            files: [new File(['image'], 'test.jpg', { type: 'image/jpeg' })]
          }
        })


        expect(handleChangeFile).toHaveBeenCalled()
        expect(fileInput.files[0].name).toBe("test.jpg")
        await waitFor(() => expect(newBill.fileUrl).toBe('url'))
      })


      test("Then it should reject an invalid file type", () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        const mockStore = {
          bills: () => ({
            create: jest.fn().mockResolvedValue({ fileUrl: 'url', key: '1234' })
          })
        }


        const newBill = new NewBill({
          document,
          onNavigate: (pathname) => document.body.innerHTML = ROUTES({ pathname }),
          store: mockStore,
          localStorage: window.localStorage
        })


        const fileInput = screen.getByTestId("file")
        const handleChangeFile = jest.fn(newBill.handleChangeFile)
        fileInput.addEventListener("change", handleChangeFile)


        jest.spyOn(window, 'alert').mockImplementation(() => {})


        fireEvent.change(fileInput, {
          target: {
            files: [new File(['text'], 'test.txt', { type: 'text/plain' })]
          }
        })


        expect(handleChangeFile).toHaveBeenCalled()
        expect(window.alert).toHaveBeenCalledWith("Seuls les fichiers jpg, jpeg et png sont acceptés")
        expect(fileInput.value).toBe("")
      })


      test("Then it should handle API error on file upload", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        const mockStore = {
          bills: () => ({
            create: jest.fn().mockRejectedValue(new Error("Erreur API"))
          })
        }


        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage
        })


        const consoleSpy = jest.spyOn(console, 'error')
        const fileInput = screen.getByTestId("file")


        fireEvent.change(fileInput, {
          target: {
            files: [new File(['image'], 'test.jpg', { type: 'image/jpeg' })]
          }
        })


        await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      })
    })


    describe("When I submit the form", () => {
      test("Then it should submit the bill and redirect to Bills", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        const mockStore = {
          bills: () => ({
            update: jest.fn().mockResolvedValue({})
          })
        }


        const onNavigate = jest.fn()
        const newBill = new NewBill({
          document,
          onNavigate,
          store: mockStore,
          localStorage: window.localStorage
        })


        // Set required file data
        newBill.fileUrl = 'url'
        newBill.fileName = 'test.jpg'


        // Submit form
        const form = screen.getByTestId("form-new-bill")
        fireEvent.submit(form)


        expect(onNavigate).toHaveBeenCalledWith(ROUTES_PATH['Bills'])
      })
    })


    // Test d'intégration POST
    describe("When I submit a new bill (Integration)", () => {
      test("Then the bill should be created in API", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        // Mock store for integration test
        const createMock = jest.fn().mockResolvedValue({ fileUrl: 'url', key: '1234' })
        const updateMock = jest.fn().mockResolvedValue({})
        const mockStore = {
          bills: () => ({
            create: createMock,
            update: updateMock
          })
        }


        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage
        })


        // Upload file first
        const fileInput = screen.getByTestId("file")
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['image'], 'test.jpg', { type: 'image/jpeg' })]
          }
        })


        // Wait for file upload
        await waitFor(() => expect(createMock).toHaveBeenCalled())


        // Submit form
        const form = screen.getByTestId("form-new-bill")
        fireEvent.submit(form)


        // Verify bill update
        await waitFor(() => expect(updateMock).toHaveBeenCalled())
      })


      test("Then it should handle API errors", async () => {
        const html = NewBillUI()
        document.body.innerHTML = html


        const consoleSpy = jest.spyOn(console, 'error')
        const mockStore = {
          bills: () => ({
            create: jest.fn().mockRejectedValue(new Error("Erreur API")),
            update: jest.fn().mockRejectedValue(new Error("Erreur API"))
          })
        }


        const newBill = new NewBill({
          document,
          onNavigate: jest.fn(),
          store: mockStore,
          localStorage: window.localStorage
        })


        const fileInput = screen.getByTestId("file")
        fireEvent.change(fileInput, {
          target: {
            files: [new File(['image'], 'test.jpg', { type: 'image/jpeg' })]
          }
        })


        await waitFor(() => expect(consoleSpy).toHaveBeenCalled())
      })
    })
  })
})

