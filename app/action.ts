"use server";

export const checkUser = async (email?: string) => {
  if (!email) return;

  try {
    const response = await fetch(
      `${
        process.env.NEXT_PUBLIC_BACKEND_URL
      }/utilisateur/get?email=${encodeURIComponent(email)}`,
      { cache: "no-store" }
    );

    if (response.status === 404) {
      const createRes = await fetch(
        `${process.env.NEXT_PUBLIC_BACKEND_URL}/utilisateur/post`,
        {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            email,
            nom: "",
            prenom: "",
            adresse: "",
            telephone: "",
            role: "vendeur",
          }),
        }
      );

      const newUser = await createRes.json();
      console.log("Nouvel utilisateur ajouté :", newUser);
      return newUser.role;
    } else {
      const user = await response.json();
      console.log("Utilisateur déjà existant :", user);
      return user.role;
    }
  } catch (err) {
    console.error("checkUser error:", err);
  }
};
