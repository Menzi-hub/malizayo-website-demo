
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   SUPABASE DATABASE CONNECTION
   SEPARATE ADMIN AND PARENT SESSIONS
===================================== */

(function () {

    const SUPABASE_URL =
        "https://pdxyppmsotygvzlekojg.supabase.co";

    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_9Kh_hViyItJUnlVzDnY1uQ_s1G2He40";


    // CHECK SUPABASE LIBRARY

    if (
        !window.supabase ||
        !window.supabase.createClient
    ) {

        console.error(
            "Supabase library did not load."
        );

        return;

    }


    // IDENTIFY THE CURRENT PORTAL

    const isParentPortal =
        window.location.pathname
            .toLowerCase()
            .endsWith("/parent.html");


    // AUTHENTICATION SETTINGS

    const authOptions = {

        autoRefreshToken: true,

        persistSession: true,

        detectSessionInUrl: true

    };


    // GIVE PARENTS A SEPARATE LOGIN STORAGE

    if (isParentPortal) {

        authOptions.storageKey =
            "malizayo-parent-auth-v1";

    }


    // INITIALISE SUPABASE

    window.malizayoSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY,
            {
                auth: authOptions
            }
        );


    console.log(
        isParentPortal
            ? "Malizayo Parent Portal Supabase connection initialized."
            : "Malizayo Administrator Supabase connection initialized."
    );

})();
