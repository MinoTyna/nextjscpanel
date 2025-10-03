// import { clerkClient } from "@clerk/clerk-sdk-node";

// export default async function handler(req, res) {
//   if (req.method !== "POST") return res.status(405).end();

//   const { email } = req.body;

//   try {
//     await clerkClient.users.resetPassword(email);
//     return res
//       .status(200)
//       .json({ message: "Email envoyé si utilisateur existant." });
//   } catch (error) {
//     console.error(error);
//     return res
//       .status(500)
//       .json({ error: "Erreur lors de la réinitialisation" });
//   }
// }
