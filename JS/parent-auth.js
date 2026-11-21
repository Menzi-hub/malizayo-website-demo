
/* =====================================
   MALIZAYO PRIMARY SCHOOL
   PARENT PORTAL AUTHENTICATION
===================================== */

(function () {

    "use strict";

    const supabase = window.malizayoSupabase;

    const loginPanel =
        document.getElementById("parentLoginPanel");

    const passwordPanel =
        document.getElementById("parentPasswordSetupPanel");

    const dashboard =
        document.getElementById("parentDashboard");

    const loginForm =
        document.getElementById("parentLoginForm");

    const emailInput =
        document.getElementById("parentEmail");

    const passwordInput =
        document.getElementById("parentPassword");

    const loginButton =
        document.getElementById("parentLoginButton");

    const forgotPasswordButton =
        document.getElementById("parentForgotPasswordButton");

    const loginMessage =
        document.getElementById("parentLoginMessage");

    const passwordSetupForm =
        document.getElementById("parentPasswordSetupForm");

    const newPasswordInput =
        document.getElementById("parentNewPassword");

    const confirmPasswordInput =
        document.getElementById("parentConfirmPassword");

    const passwordSetupButton =
        document.getElementById("parentPasswordSetupButton");

    const passwordSetupMessage =
        document.getElementById("parentPasswordSetupMessage");

    const PARENT_REDIRECT_URL =
        "https://menzi-hub.github.io/malizayo-website-demo/parent.html";

    const authLinkType =
        window.__malizayoParentAuthType || "";

    let logoutButton = null;


    // =====================================
    // CHECK REQUIRED ELEMENTS
    // =====================================

    if (
        !supabase ||
        !loginPanel ||
        !passwordPanel ||
        !dashboard ||
        !loginForm ||
        !emailInput ||
        !passwordInput ||
        !loginButton ||
        !forgotPasswordButton ||
        !loginMessage ||
        !passwordSetupForm ||
        !newPasswordInput ||
        !confirmPasswordInput ||
        !passwordSetupButton ||
        !passwordSetupMessage
    ) {

        console.error(
            "Parent authentication could not initialise."
        );

        return;

    }


    // =====================================
    // CREATE LOGOUT BUTTON
    // =====================================

    function createLogoutButton() {

        if (logoutButton) return;

        logoutButton =
            document.createElement("button");

        logoutButton.type = "button";

        logoutButton.id = "parentLogoutButton";

        logoutButton.className = "parent-button";

        logoutButton.textContent = "Log Out";

        logoutButton.hidden = true;


        logoutButton.addEventListener(
            "click",
            async function () {

                logoutButton.disabled = true;

                logoutButton.textContent =
                    "Signing out...";

                try {

                    const { error } =
                        await supabase.auth.signOut();

                    if (error) throw error;

                    showLogin("You have signed out.");

                } catch (error) {

                    console.error(
                        "Parent logout failed:",
                        error
                    );

                    loginMessage.textContent =
                        "Unable to sign out. Please try again.";

                } finally {

                    logoutButton.disabled = false;

                    logoutButton.textContent = "Log Out";

                }

            }
        );


        loginPanel
            .querySelector(".parent-login-card")
            .appendChild(logoutButton);

    }


    // =====================================
    // SHOW LOGIN SCREEN
    // =====================================

    function showLogin(message) {

        loginPanel.hidden = false;
        loginPanel.style.display = "flex";

        passwordPanel.hidden = true;
        passwordPanel.style.display = "none";

        dashboard.hidden = true;

        loginForm.hidden = false;

        forgotPasswordButton.hidden = false;

        createLogoutButton();

        logoutButton.hidden = true;

        loginMessage.textContent =
            message || "";

        loginMessage.style.color = "#922E26";

    }


    // =====================================
    // SHOW PASSWORD CREATION SCREEN
    // =====================================

    function showPasswordSetup(message) {

        loginPanel.hidden = true;

        passwordPanel.hidden = false;
        passwordPanel.style.display = "flex";

        dashboard.hidden = true;

        passwordSetupMessage.textContent =
            message ||
            "Please create your Parent Portal password.";

    }


    // =====================================
    // VERIFY PARENT PROFILE
    // =====================================

    async function verifyParentProfile(userId) {

        const { data: profile, error } =
            await supabase
                .from("parent_profiles")
                .select("user_id, full_name")
                .eq("user_id", userId)
                .maybeSingle();

        if (error) {
            throw error;
        }

        if (!profile) {
            throw new Error(
                "This account is not registered as a Malizayo parent."
            );
        }


        // Check whether the school has linked a learner.

        const { data: links, error: linkError } =
            await supabase
                .from("parent_learners")
                .select("learner_id")
                .eq("parent_user_id", userId);

        if (linkError) {
            throw linkError;
        }

        return {
            profile: profile,
            linkedLearners: links || []
        };

    }


   
async function showAccountStatus(userId) {

    // VERIFY THE PARENT PROFILE AND LEARNER LINKS

    const account =
        await verifyParentProfile(userId);


    // =====================================
    // PARENT HAS NO LINKED LEARNER
    // =====================================

    if (account.linkedLearners.length === 0) {

        loginPanel.hidden = false;
        loginPanel.style.display = "flex";

        passwordPanel.hidden = true;
        dashboard.hidden = true;

        loginForm.hidden = true;
        forgotPasswordButton.hidden = true;

        createLogoutButton();
        logoutButton.hidden = false;

        loginMessage.style.color = "#216638";

        loginMessage.textContent =
            "Your parent account is active, but the school has not yet linked a learner to it. Please contact the school.";

        return;

    }


    // =====================================
    // LOAD LIVE PARENT AND LEARNER DATA
    // =====================================

    if (
        typeof window.loadParentDashboard !== "function"
    ) {

        throw new Error(
            "The live Parent Dashboard has not loaded. Please refresh the page."
        );

    }


    await window.loadParentDashboard(userId);


    // =====================================
    // DISPLAY LIVE PARENT DASHBOARD
    // =====================================

    passwordPanel.hidden = true;
    passwordPanel.style.display = "none";

    loginPanel.hidden = true;
    loginPanel.style.display = "none";

    dashboard.hidden = false;


    // =====================================
    // PLACE LOGOUT BUTTON IN DASHBOARD
    // =====================================

    createLogoutButton();

    const accountArea =
        dashboard.querySelector(".parent-account");

    if (!accountArea) {

        throw new Error(
            "Parent account display could not be found."
        );

    }

    accountArea.appendChild(logoutButton);

    logoutButton.hidden = false;

}



    // =====================================
    // PARENT LOGIN
    // =====================================

    loginForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const email =
                emailInput.value.trim();

            const password =
                passwordInput.value;

            loginButton.disabled = true;

            loginButton.textContent =
                "Signing in...";

            loginMessage.textContent = "";


            try {

                const { data, error } =
                    await supabase.auth.signInWithPassword({

                        email: email,

                        password: password

                    });

                if (error) throw error;

                if (!data.user) {
                    throw new Error(
                        "Unable to verify your parent account."
                    );
                }

                await showAccountStatus(data.user.id);

            } catch (error) {

                console.error(
                    "Parent sign-in failed:",
                    error
                );

                loginMessage.textContent =
                    error.message ||
                    "Unable to sign in. Please check your details.";

                loginMessage.style.color = "#922E26";

            } finally {

                loginButton.disabled = false;

                loginButton.textContent = "Sign In";

            }

        }
    );


    // =====================================
    // FIRST-TIME PASSWORD CREATION
    // =====================================

    passwordSetupForm.addEventListener(
        "submit",
        async function (event) {

            event.preventDefault();

            const newPassword =
                newPasswordInput.value;

            const confirmPassword =
                confirmPasswordInput.value;


            if (newPassword.length < 12) {

                passwordSetupMessage.textContent =
                    "Your password must contain at least 12 characters.";

                return;

            }

            if (newPassword !== confirmPassword) {

                passwordSetupMessage.textContent =
                    "The passwords do not match.";

                return;

            }


            passwordSetupButton.disabled = true;

            passwordSetupButton.textContent =
                "Saving password...";


            try {

                const { data: userData, error: userError } =
                    await supabase.auth.getUser();

                if (userError || !userData.user) {

                    throw new Error(
                        "Your invitation session is invalid or expired."
                    );

                }


                // Verify that this is a registered parent.

                await verifyParentProfile(
                    userData.user.id
                );


                // Save the parent's password.

                const { error } =
                    await supabase.auth.updateUser({

                        password: newPassword

                    });

                if (error) throw error;


                passwordSetupForm.reset();


                // Remove invitation tokens from browser URL.

                window.history.replaceState(
                    {},
                    document.title,
                    window.location.pathname
                );


                await showAccountStatus(
                    userData.user.id
                );


            } catch (error) {

                console.error(
                    "Parent password setup failed:",
                    error
                );

                passwordSetupMessage.textContent =
                    error.message ||
                    "Unable to create your password.";

            } finally {

                passwordSetupButton.disabled = false;

                passwordSetupButton.textContent =
                    "Save Password";

            }

        }
    );


    // =====================================
    // FORGOT PASSWORD
    // =====================================

    forgotPasswordButton.addEventListener(
        "click",
        async function () {

            const email =
                emailInput.value.trim();

            if (!email) {

                loginMessage.textContent =
                    "Please enter your registered email address.";

                emailInput.focus();

                return;

            }

            forgotPasswordButton.disabled = true;

            forgotPasswordButton.textContent =
                "Sending...";

            try {

                const { error } =
                    await supabase.auth.resetPasswordForEmail(
                        email,
                        {
                            redirectTo: PARENT_REDIRECT_URL
                        }
                    );

                if (error) throw error;

                loginMessage.style.color = "#216638";

                loginMessage.textContent =
                    "If this account is registered, a password recovery email has been sent.";

            } catch (error) {

                console.error(
                    "Parent password recovery failed:",
                    error
                );

                loginMessage.textContent =
                    "Unable to send the recovery email. Please try again.";

                loginMessage.style.color = "#922E26";

            } finally {

                forgotPasswordButton.disabled = false;

                forgotPasswordButton.textContent =
                    "Forgot Password?";

            }

        }
    );


    // =====================================
    // AUTHENTICATION EVENTS
    // =====================================

    supabase.auth.onAuthStateChange(
        function (event, session) {

            if (event === "SIGNED_OUT") {

                showLogin("You have signed out.");

            }

            if (
                event === "PASSWORD_RECOVERY" ||
                (
                    event === "SIGNED_IN" &&
                    authLinkType === "invite"
                )
            ) {

                showPasswordSetup(
                    "Welcome to Malizayo Primary School. Please create your Parent Portal password."
                );

            }

        }
    );


    // =====================================
    // CHECK EXISTING SESSION
    // =====================================

    async function checkExistingSession() {

        try {

            const { data: sessionData, error: sessionError } =
                await supabase.auth.getSession();

            if (sessionError) throw sessionError;

            if (!sessionData.session) {

                showLogin(
                    authLinkType === "invite"
                        ? "Your invitation link has expired or could not be verified. Please contact the school."
                        : "Please sign in to your Parent Portal."
                );

                return;

            }


            const { data: userData, error: userError } =
                await supabase.auth.getUser();

            if (userError || !userData.user) {

                showLogin(
                    "Please sign in again."
                );

                return;

            }


            if (
                authLinkType === "invite" ||
                authLinkType === "recovery" ||
                authLinkType === "pkce"
            ) {

                showPasswordSetup(
                    "Please create your Parent Portal password."
                );

                return;

            }


            await showAccountStatus(
                userData.user.id
            );


        } catch (error) {

            console.error(
                "Parent session verification failed:",
                error
            );

            showLogin(
                "Unable to verify your account. Please sign in again."
            );

        }

    }


    // START AUTHENTICATION

    showLogin("Checking parent access...");

    createLogoutButton();

    checkExistingSession();


})();
