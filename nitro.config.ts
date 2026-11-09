// Keep the Vercel server function close to the Singapore Neon database.
export default {
  vercel: {
    functions: { regions: ["sin1"] },
  },
};
