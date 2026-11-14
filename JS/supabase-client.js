
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   SUPABASE DATABASE CONNECTION
===================================== */

(function () {

    // Your Supabase project URL
    const SUPABASE_URL =
        "https://pdxyppmsotygvzlekojg.supabase.co";

    // Your Supabase publishable key
    const SUPABASE_PUBLISHABLE_KEY =
        "sb_publishable_9Kh_hViyItJUnlVzDnY1uQ_s1G2He40";


    // Check whether the Supabase library loaded

    if (!window.supabase ||
        !window.supabase.createClient) {

        console.error(
            "Supabase library did not load."
        );

        return;
    }


    // Connect to the database

    window.malizayoSupabase =
        window.supabase.createClient(
            SUPABASE_URL,
            SUPABASE_PUBLISHABLE_KEY
        );


    console.log(
        "Malizayo Supabase connection initialized."
    );

})();
