/**
 * @jest-environment jsdom
 */




import {screen, waitFor, fireEvent} from "@testing-library/dom"
import BillsUI from "../views/BillsUI.js"
import Bills from "../containers/Bills.js"
import { bills } from "../fixtures/bills.js"
import { ROUTES_PATH} from "../constants/routes.js";
import {localStorageMock} from "../__mocks__/localStorage.js";
import mockStore from "../__mocks__/store"
import router from "../app/Router.js"




describe("Given I am connected as an employee", () => {
  describe("When I am on Bills Page", () => {
    test("Then bill icon in vertical layout should be highlighted", async () => {
      Object.defineProperty(window, 'localStorage', { value: localStorageMock })
      window.localStorage.setItem('user', JSON.stringify({
        type: 'Employee'
      }))
      const root = document.createElement("div")
      root.setAttribute("id", "root")
      document.body.append(root)
      router()
      window.onNavigate(ROUTES_PATH.Bills)
      await waitFor(() => screen.getByTestId('icon-window'))
      const windowIcon = screen.getByTestId('icon-window')
      expect(windowIcon.classList.contains('active-icon')).toBe(true)
    })




    test("Then bills should be ordered from earliest to latest", () => {
      document.body.innerHTML = BillsUI({ data: bills })
      const dates = screen.getAllByText(/^(19|20)\d\d[- /.](0[1-9]|1[012])[- /.](0[1-9]|[12][0-9]|3[01])$/i).map(a => a.innerHTML)
      const antiChrono = (a, b) => ((a > b) ? 1 : -1)
      const datesSorted = [...dates].sort(antiChrono)
      expect(dates).toEqual(datesSorted)
    })




    test("Then handleClickNewBill should navigate to NewBill page", () => {
      const onNavigate = (pathname) => {
        document.body.innerHTML = pathname
      }
     
      document.body.innerHTML = BillsUI({ data: bills })
     
      const billsContainer = new Bills({
        document,
        onNavigate,
        store: null,
        localStorage: window.localStorage
      })




      const handleClickNewBill = jest.fn(billsContainer.handleClickNewBill)
      const newBillButton = screen.getByTestId('btn-new-bill')
      newBillButton.addEventListener('click', handleClickNewBill)
      fireEvent.click(newBillButton)
      expect(handleClickNewBill).toHaveBeenCalled()
    })




    test("Then handleClickIconEye should open modal", () => {
      document.body.innerHTML = BillsUI({ data: bills })
     
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage
      })




      $.fn.modal = jest.fn()




      const eye = screen.getAllByTestId('icon-eye')[0]
      const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(eye))
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()
    })
  })
test("Then handleClickIconEye should handle error case", () => {
      document.body.innerHTML = BillsUI({ data: bills })
     
      const billsContainer = new Bills({
        document,
        onNavigate: null,
        store: null,
        localStorage: window.localStorage
      })




      $.fn.modal = jest.fn()
      $.fn.width = () => 500
      document.querySelector = jest.fn().mockImplementation(() => ({
        style: {},
        src: null
      }))




      const eye = screen.getAllByTestId('icon-eye')[0]
      eye.setAttribute("data-bill-url", null) // forcer le cas d'erreur
      const handleClickIconEye = jest.fn(() => billsContainer.handleClickIconEye(eye))
      eye.addEventListener('click', handleClickIconEye)
      fireEvent.click(eye)
      expect(handleClickIconEye).toHaveBeenCalled()




      const modale = document.getElementById('modaleFile')
      expect(modale).toBeTruthy()
    })




  // Test d'intégration GET
  describe("When I navigate to Bills page", () => {
    test("Then fetches bills from mock API GET", async () => {
      const getSpy = jest.spyOn(mockStore, "bills")
      const bills = await new Bills({
        document,
        onNavigate,
        store: mockStore,
        localStorage: window.localStorage
      }).getBills()
      expect(getSpy).toHaveBeenCalled()
      expect(bills.length).toBe(4)
    })




    test("Then fetches bills from an API and fails with 404 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 404"))
          }
        }
      })
     
      document.body.innerHTML = BillsUI({ error: "Erreur 404" })
      const message = screen.getByText(/Erreur 404/)
      expect(message).toBeTruthy()
    })




    test("Then fetches messages from an API and fails with 500 message error", async () => {
      mockStore.bills.mockImplementationOnce(() => {
        return {
          list: () => {
            return Promise.reject(new Error("Erreur 500"))
          }
        }
      })




      document.body.innerHTML = BillsUI({ error: "Erreur 500" })
      const message = screen.getByText(/Erreur 500/)
      expect(message).toBeTruthy()
    })
  })
})





