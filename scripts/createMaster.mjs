import { adminAuth, adminDb } from "../src/lib/firebase-admin.ts"

async function run() {
  try {
    const user = await adminAuth.createUser({
      email: "renan_master@pdv.local",
      password: "Arl@310828",
    })

    await adminDb.collection("users").doc(user.uid).set({
      username: "renan_master",
      role: "admin",
    })

    console.log("✅ MASTER criado:", user.uid)

  } catch (error) {
    if (error?.code === "auth/email-already-exists") {
      console.log("⚠️ Usuário já existe")
      return
    }

    console.error(error)
  }
}

run()