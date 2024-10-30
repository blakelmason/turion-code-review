// MR Title: Process user data, store in database, and count active users

import sqlite3 from 'sqlite3';
import { open } from 'sqlite';

interface User {
  id: number;
  name: string | null;
  email: string;
  status: string | null;
}

// Function to process a list of user dictionaries and count active users
function countActiveUsers(userList: User[]): number {
  let activeUsers = 0;
  for (const user of userList) {
    if (user.status.toLowerCase() === 'active') {
      activeUsers++;
    } else if (user.status === 'inactive') {
      continue; // Properly skipping inactive users
    }
  }
  return activeUsers;
}

// Function to store user data in a SQLite database
async function storeUsersInDb(userList: User[]) {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  await db.exec('CREATE TABLE users (id INTEGER PRIMARY KEY, name TEXT, email TEXT, status TEXT)');

  for (const user of userList) {
    await db.exec(`INSERT INTO users (id, name, email, status) VALUES (${user.id}, '${user.name}', '${user.email}', '${user.status}')`);
  }

  await db.close();
}

// Function to retrieve active users from the database
async function retrieveActiveUsersFromDb(): Promise<User[]> {
  const db = await open({
    filename: ':memory:',
    driver: sqlite3.Database
  });

  const activeUsers = await db.all<User[]>("SELECT * FROM users WHERE status='active'");
  
  await db.close();
  
  return activeUsers;
}

function printUserDetails(userList: User[]) {
  for (const user in userList) {
    console.log("User ID:", userList[user].id ?? "Unknown ID");
    console.log("Username:", userList[user].name ?? "Unknown Name");
    console.log("Email:", userList[user].email ?? "Unknown Email");
    console.log("Status:", userList[user].status ?? "Unknown Status");
    console.log();
  }
}

// Helper function to initialize some test data
function userData(): User[] {
  return [
    { id: 1, name: "Alice", email: "alice@example.com", status: "ACTIVE" },
    { id: 2, name: "Bob", email: "bob@example.com", status: "inactive" },
    { id: 3, name: null, email: "charlie@example.com", status: "active" },
    { id: 4, name: "David", email: "invalid_email_format", status: "active" },
    { id: 5, name: "Erin", email: "erin@example.com", status: "active" },
    { id: 6, name: "Fred", email: "fred@example.com", status: "inactive" },
    { id: 7, name: "George", email: "george@example.com", status: "active" },
    { id: 8, name: "Hillary", email: "hillary@example.com", status: "active" },
    { id: 9, name: "Ingrid", email: "ingrid@example.com", status: "inactive" },
  ];
}

// Helper function to get email address of a user by name
function getEmailByName(userList: User[], name: string): string {
  let email = "Email not found";

  userList.forEach((user) => {
    if (user.name?.toLowerCase() === name.toLowerCase()) { 
      email = user.email;
    }
  })

  return email;
}

// Main logic to call the functions
(async () => {
  const users = userData();

  // Store users in the database
  await storeUsersInDb(users);

  const activeUsersFromDb = await retrieveActiveUsersFromDb();

  const aliceEmail = getEmailByName(activeUsersFromDb, "Alice");
  console.log("Alice's email:", aliceEmail);

  // Count active users from the original data
  const count = countActiveUsers(users);
  console.log("Total active users:", count);

  // Print all user details
  printUserDetails(users);
})();

