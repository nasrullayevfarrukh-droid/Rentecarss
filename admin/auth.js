(function () {
  const Data = window.RentacarData;
  if (!Data) return;

  const ROUTES = new Set(["dashboard", "cars", "reservations", "media", "settings"]);

  const sanitizeRoute = (route) => {
    const clean = String(route || "").replace(/^#/, "").trim().toLowerCase();
    return ROUTES.has(clean) ? clean : "dashboard";
  };

  const hasStoredSession = () => Boolean(Data.getStoredSession());

  const ensureAuthenticated = async () => {
    const session = await Data.ensureAdminSession();
    if (!session) {
      throw new Error("Admin sessiyası tapılmadı.");
    }
    return session;
  };

  const signIn = async (email, password) => Data.signInAdmin({ email, password });

  const logout = () => {
    Data.clearStoredSession();
  };

  const redirectToAdmin = (route) => {
    window.location.replace(`./index.html#${sanitizeRoute(route)}`);
  };

  const redirectToLogin = (route) => {
    window.location.replace(`./login.html#${sanitizeRoute(route)}`);
  };

  window.RentacarAdminAuth = {
    sanitizeRoute,
    hasStoredSession,
    ensureAuthenticated,
    signIn,
    logout,
    redirectToAdmin,
    redirectToLogin,
  };
})();
