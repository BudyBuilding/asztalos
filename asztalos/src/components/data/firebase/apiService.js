//apiService.js
import store from "../store/store"; // Redux store importálása

import { getClientsSuccess, getWorksSuccess } from "../store/actions/actions"; // Frissítsd az elérési utat, ha szükséges

const BASE_URL = "https://api.example.com";
const works = [
  {
    workId: 1,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 2,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 3,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 4,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 5,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 6,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 7,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 8,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 9,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 10,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 11,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 12,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 13,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 14,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 15,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 16,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 17,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 18,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 19,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 20,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 21,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 22,
    Client: "Chereji Clau",
    Date: new Date("2024-03-30"),
    Status: "Completed",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 23,
    Client: "Irina geta",
    Date: new Date("2024-04-05"),
    Status: "In Progress",
    Price: 2024,
    Paid: 1500,
  },
  {
    workId: 24,
    Client: "Aronia",
    Date: new Date("2024-04-10"),
    Status: "Pending",
    Price: 2024,
    Paid: 1500,
  },
];

const clients = [
  {
    ClientId: 1,
    Name: "John Doe",
    Tel: "+40758612749",
    Address: "123 Main Street, New York",
  },
  {
    ClientId: 2,
    Name: "Alice Smith",
    Tel: "+123456789",
    Address: "456 Park Avenue, Los Angeles",
  },
  {
    ClientId: 3,
    Name: "Michael Johnson",
    Tel: "+987654321",
    Address: "789 Maple Street, Chicago",
  },
  {
    ClientId: 4,
    Name: "Emma Davis",
    Tel: "+135792468",
    Address: "246 Elm Street, San Francisco",
  },
  {
    ClientId: 5,
    Name: "James Wilson",
    Tel: "+246813579",
    Address: "357 Oak Street, Boston",
  },
  {
    ClientId: 6,
    Name: "Sophia Martinez",
    Tel: "+369258147",
    Address: "258 Pine Street, Seattle",
  },
  {
    ClientId: 7,
    Name: "Olivia Brown",
    Tel: "+987654321",
    Address: "753 Cedar Street, Miami",
  },
  {
    ClientId: 8,
    Name: "William Taylor",
    Tel: "+456123789",
    Address: "159 Birch Street, Dallas",
  },
  {
    ClientId: 9,
    Name: "Emily Johnson",
    Tel: "+321654987",
    Address: "852 Willow Street, Houston",
  },
  {
    ClientId: 10,
    Name: "Daniel Garcia",
    Tel: "+789654123",
    Address: "369 Maple Street, Atlanta",
  },
  {
    ClientId: 11,
    Name: "Isabella Lopez",
    Tel: "+159753468",
    Address: "753 Elm Street, Philadelphia",
  },
  {
    ClientId: 12,
    Name: "Matthew Young",
    Tel: "+753159852",
    Address: "159 Pine Street, Phoenix",
  },
  {
    ClientId: 13,
    Name: "Ethan Hernandez",
    Tel: "+357159753",
    Address: "357 Oak Street, Las Vegas",
  },
  {
    ClientId: 14,
    Name: "Sofia Martinez",
    Tel: "+258963147",
    Address: "258 Cedar Street, San Diego",
  },
  {
    ClientId: 15,
    Name: "Mia Rodriguez",
    Tel: "+654321987",
    Address: "987 Maple Street, Washington D.C.",
  },
  {
    ClientId: 16,
    Name: "Alexander Wilson",
    Tel: "+951753852",
    Address: "753 Oak Street, San Antonio",
  },
  {
    ClientId: 17,
    Name: "Charlotte Gonzalez",
    Tel: "+741852963",
    Address: "147 Pine Street, Denver",
  },
  {
    ClientId: 18,
    Name: "Jacob Perez",
    Tel: "+369258147",
    Address: "258 Elm Street, Orlando",
  },
  {
    ClientId: 19,
    Name: "Ava Carter",
    Tel: "+852369741",
    Address: "369 Cedar Street, Nashville",
  },
  {
    ClientId: 20,
    Name: "Liam Scott",
    Tel: "+123987456",
    Address: "456 Birch Street, Austin",
  },
];
const apiService = {
  // Kliensek lekérdezése
  getClients: async (userId) => {
    try {
      console.log("itt vagyunk");
      store.dispatch(getClientsSuccess(clients));
    } catch (error) {
      console.error("Error while fetching clients:", error);
      throw error;
    }
  },

  // Munkák lekérdezése
  getWorks: async (userId) => {
    try {
      store.dispatch(getWorksSuccess(works));
    } catch (error) {
      console.error("Error while fetching works:", error);
      throw error;
    }
  },
};

export default apiService;

export const GET_CLIENTS_SUCCESS = "GET_CLIENTS_SUCCESS";
export const GET_WORKS_SUCCESS = "GET_WORKS_SUCCESS";
