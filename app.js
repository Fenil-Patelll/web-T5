const express = require("express");
const app = express();
const { v4: uuidv4 } = require("uuid");
const fs = require("fs");

// Import the users array from the "users.js" file
let users = require("./users");

app.use(express.json());

// GET API endpoint to retrieve all users
app.get("/users", (req, res) => {
    const response = {
        message: "Users retrieved",
        success: true,
        users: users,
    };

    res.status(200).json(response);
});

// PUT API endpoint to update an existing user by ID
app.put("/update/:id", (req, res) => {
    const id = req.params.id;
    const { email, firstName } = req.body;

    // Find the user in the users array by ID
    const user = users.find((user) => user.id === id);

    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    // Update the user's email and/or firstName if provided in the request body
    if (email) {
        user.email = email;
    }
    if (firstName) {
        user.firstName = firstName;
    }

    // Save the updated users data to the "users.js" file
    saveUsersData(res, "User updated", "Failed to update user");
});

// POST API endpoint to add a new user
app.post("/add", (req, res) => {
    const { email, firstName } = req.body;

    // Create a new user object with a unique ID using uuidv4()
    const newUser = {
        email,
        firstName,
        id: uuidv4(),
    };

    // Add the new user to the users array
    users.push(newUser);

    // Save the updated users data to the "users.js" file
    saveUsersData(res, "User added successfully", "Error while adding user");
});

// GET API endpoint to retrieve a user by ID
app.get("/user/:id", (req, res) => {
    const id = req.params.id;

    // Find the user in the users array by ID
    const user = users.find((user) => user.id === id);

    if (!user) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    // Return the user object in the response
    res.status(200).json({ success: true, user });
});

// DELETE API endpoint to delete a user by ID
app.delete("/delete/:id", (req, res) => {
    const id = req.params.id;

    // Find the index of the user in the users array by ID
    const index = users.findIndex((user) => user.id === id);

    if (index === -1) {
        return res.status(404).json({ message: "User not found", success: false });
    }

    // Remove the user from the users array
    const deletedUser = users.splice(index, 1)[0];

    // Save the updated users data to the "users.js" file
    saveUsersData(res, "User deleted", "Internal server error", { message: "User deleted", success: true, deletedUser });
});

// Function to save the updated users data to the "users.js" file
function saveUsersData(res, successMessage, errorMessage, response = null) {
    fs.writeFile("./users.js", `module.exports = ${JSON.stringify(users, null, 2)};`, (err) => {
        if (err) {
            console.error("Error writing to users.js file:", err);
            return res.status(500).json({ message: errorMessage, success: false });
        }

        console.log("Users data saved successfully");
        if (response) {
            res.status(200).json(response);
        } else {
            res.status(200).json({ message: successMessage, success: true });
        }
    });
}

// Start the server
const port = 3000;
app.listen(port, () => {
    console.log(`Server is running on the port 3000`);
});
