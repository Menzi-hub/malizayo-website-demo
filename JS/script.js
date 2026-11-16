

/* =====================================
   MALIZAYO PRIMARY SCHOOL WEBSITE
   MAIN JAVASCRIPT FILE
===================================== */

(function () {

    // Prevent this file from initializing twice
    if (window.__malizayoScriptInitialized) {
        return;
    }

    window.__malizayoScriptInitialized = true;


    /* =====================================
       1. MOBILE NAVIGATION MENU
    ===================================== */

    const menuButton =
        document.getElementById("menuButton");

    const navigation =
        document.getElementById("navigation");

    if (menuButton && navigation) {

        menuButton.addEventListener("click", function () {

            navigation.classList.toggle("show");

            const isOpen =
                navigation.classList.contains("show");

            menuButton.setAttribute(
                "aria-expanded",
                isOpen
            );

        });

        navigation.querySelectorAll("a").forEach(function (link) {

            link.addEventListener("click", function () {

                navigation.classList.remove("show");

                menuButton.setAttribute(
                    "aria-expanded",
                    "false"
                );

            });

        });

    }


    /* =====================================
       2. CONTACT FORM
    ===================================== */

    const contactForm =
        document.getElementById("contactForm");

    if (contactForm) {

        contactForm.addEventListener("submit", function (event) {

            event.preventDefault();

            alert(
                "Thank you for contacting Malizayo Primary School. " +
                "This is a demonstration form. Messages are not yet sent."
            );

            contactForm.reset();

        });

    }


    /* =====================================
       3. ONLINE ADMISSION FORM
    ===================================== */

    const admissionForm =
        document.getElementById("admissionForm");

    if (admissionForm) {

        const signatureCanvas =
            document.getElementById("signaturePad");

        const clearButton =
            document.getElementById("clearSignature");

        const signatureStatus =
            document.getElementById("signatureStatus");

        const message =
            document.getElementById("admissionMessage");


        // Check that all required elements exist

        if (
            signatureCanvas &&
            clearButton &&
            signatureStatus &&
            message
        ) {

            const context =
                signatureCanvas.getContext("2d");

            if (context) {

                let drawing = false;

                let hasSignature = false;


                // Signature appearance

                context.strokeStyle = "#173B5C";

                context.lineWidth = 3;

                context.lineCap = "round";

                context.lineJoin = "round";


                /* =====================================
                   4. GET MOUSE OR FINGER POSITION
                ===================================== */

                function getPosition(event) {

                    const rectangle =
                        signatureCanvas.getBoundingClientRect();

                    return {

                        x:
                            (event.clientX - rectangle.left) *
                            (signatureCanvas.width / rectangle.width),

                        y:
                            (event.clientY - rectangle.top) *
                            (signatureCanvas.height / rectangle.height)

                    };

                }


                /* =====================================
                   5. START DRAWING
                ===================================== */

                function startDrawing(event) {

                    event.preventDefault();

                    drawing = true;

                    signatureCanvas.setPointerCapture(
                        event.pointerId
                    );

                    const position = getPosition(event);

                    context.beginPath();

                    context.moveTo(
                        position.x,
                        position.y
                    );

                    context.lineTo(
                        position.x + 0.5,
                        position.y + 0.5
                    );

                    context.stroke();

                    hasSignature = true;

                    signatureStatus.textContent =
                        "Signature added.";

                }


                /* =====================================
                   6. CONTINUE DRAWING
                ===================================== */

                function drawSignature(event) {

                    if (!drawing) {
                        return;
                    }

                    event.preventDefault();

                    const position = getPosition(event);

                    context.lineTo(
                        position.x,
                        position.y
                    );

                    context.stroke();

                }


                /* =====================================
                   7. STOP DRAWING
                ===================================== */

                function stopDrawing() {

                    drawing = false;

                    context.beginPath();

                }


                // Connect the drawing events

                signatureCanvas.addEventListener(
                    "pointerdown",
                    startDrawing
                );

                signatureCanvas.addEventListener(
                    "pointermove",
                    drawSignature
                );

                signatureCanvas.addEventListener(
                    "pointerup",
                    stopDrawing
                );

                signatureCanvas.addEventListener(
                    "pointercancel",
                    stopDrawing
                );


                /* =====================================
                   8. CLEAR SIGNATURE
                ===================================== */

                clearButton.addEventListener("click", function () {

                    context.clearRect(
                        0,
                        0,
                        signatureCanvas.width,
                        signatureCanvas.height
                    );

                    hasSignature = false;

                    signatureStatus.textContent =
                        "No signature yet.";

                });


              


/* =====================================
   9. SECURE ADMISSION SUBMISSION
   CLOUDFLARE + SUPABASE EDGE FUNCTION
===================================== */

admissionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const submitButton =
            admissionForm.querySelector(
                'button[type="submit"]'
            );

        const supabase = window.malizayoSupabase;

        const declaration =
            document.getElementById("declaration");

        // CHECK SIGNATURE

        if (!hasSignature) {

            message.textContent =
                "Please draw your signature before submitting.";

            message.style.display = "block";
            return;

        }

        // CHECK DECLARATION

        if (!declaration.checked) {

            message.textContent =
                "Please accept the declaration before submitting.";

            message.style.display = "block";
            return;

        }

        // CHECK SUPABASE CONNECTION

        if (!supabase) {

            message.textContent =
                "Database connection unavailable. Please try again.";

            message.style.display = "block";
            return;

        }

        // CHECK CLOUDFLARE TOKEN

        const turnstileInput =
            admissionForm.querySelector(
                '[name="cf-turnstile-response"]'
            );

        const turnstileToken =
            turnstileInput
                ? turnstileInput.value
                : "";

        if (!turnstileToken) {

            message.textContent =
                "Please complete the security check.";

            message.style.display = "block";
            return;

        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting securely...";

        try {

            // COLLECT APPLICATION DETAILS

            const application = {

                learner_name:
                    document.getElementById("learnerName").value.trim(),

                date_of_birth:
                    document.getElementById("dateOfBirth").value,

                grade_applying_for:
                    document.getElementById("grade").value,

                previous_school:
                    document.getElementById("previousSchool").value.trim(),

                parent_guardian_name:
                    document.getElementById("parentName").value.trim(),

                relationship_to_learner:
                    document.getElementById("relationship").value,

                parent_phone:
                    document.getElementById("parentPhone").value.trim(),

                parent_email:
                    document.getElementById("parentEmail").value.trim(),

                residential_address:
                    document.getElementById("address").value.trim(),

                signature_name:
                    document.getElementById("signatureName").value.trim(),

                declaration_accepted: true

            };


            // CONVERT DRAWN SIGNATURE TO PNG

            const signatureBlob = await new Promise(
                function (resolve, reject) {

                    signatureCanvas.toBlob(
                        function (blob) {

                            if (blob) {
                                resolve(blob);
                            } else {
                                reject(
                                    new Error(
                                        "Unable to process your signature."
                                    )
                                );
                            }

                        },
                        "image/png"
                    );

                }
            );


            // PREPARE MULTIPART REQUEST

            const formData = new FormData();

            formData.append(
                "application",
                JSON.stringify(application)
            );

            formData.append(
                "turnstileToken",
                turnstileToken
            );


            // ADD FOUR SUPPORTING DOCUMENTS

            const documentFields = [
                "birthCertificate",
                "parentID",
                "proofResidence",
                "previousReport"
            ];

            documentFields.forEach(function (field) {

                const input =
                    document.getElementById(field);

                if (input && input.files.length > 0) {

                    const file = input.files[0];

                    if (file.size > 5 * 1024 * 1024) {
                        throw new Error(
                            "Each document must be 5 MB or smaller."
                        );
                    }

                    formData.append(field, file);

                }

            });


            // ADD DRAWN SIGNATURE

            const signatureFile = new File(
                [signatureBlob],
                "signature.png",
                {
                    type: "image/png"
                }
            );

            formData.append(
                "signature",
                signatureFile
            );


            // SEND TO SECURE SUPABASE EDGE FUNCTION

            const { data, error } =
                await supabase.functions.invoke(
                    "submit-admission",
                    {
                        body: formData
                    }
                );


            if (error) {

                let errorMessage = error.message;

                try {

                    if (error.context) {

                        const errorDetails =
                            await error.context.json();

                        errorMessage =
                            errorDetails.message ||
                            errorMessage;

                    }

                } catch (ignored) {
                    // Keep the original error message.
                }

                throw new Error(errorMessage);

            }


            if (!data || !data.success) {

                throw new Error(
                    data?.message ||
                    "The application could not be submitted."
                );

            }


            // DISPLAY SUCCESS

            message.style.display = "block";

            message.textContent =
                "DEMONSTRATION TEST SUCCESSFUL! " +
                "Secure submission completed. " +
                "Reference: " + data.reference +
                ". This is not an official admission.";

            admissionForm.reset();

            context.clearRect(
                0,
                0,
                signatureCanvas.width,
                signatureCanvas.height
            );

            hasSignature = false;

            signatureStatus.textContent =
                "No signature yet.";


            message.scrollIntoView({
                behavior: "smooth",
                block: "center"
            });


        } catch (error) {

            console.error(
                "Secure admission submission failed:",
                error
            );

            message.style.display = "block";

            message.textContent =
                error.message ||
                "Submission failed. Please try again.";

        } finally {

            // TURNSTILE TOKENS ARE SINGLE-USE

            if (window.turnstile) {
                window.turnstile.reset();
            }

            submitButton.disabled = false;

            submitButton.textContent =
                "Submit Application";

        }

    }
);


                     

                  
            }

        }

    }

})();
