// role.router.js
const router = express.Router();

// Route to create a new role. Accessible only by Admins after token verification.
router.post("/", verifyAdmin, createRole); // Simplified path

// Route to update an existing role by ID. Accessible only by Admins after token verification.
router.put("/:id", verifyAdmin, updateRole); // Simplified path

// Route to retrieve all roles. No verification middleware, hence accessible by all.
router.get("/", getAllRoles); // Simplified path

// Route to delete an existing role by ID. No verification middleware; might be a security concern.
router.delete("/:id", deleteRole); // Simplified path

export default router;
