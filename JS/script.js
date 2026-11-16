

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
                   9. SUBMIT ADMISSION DEMONSTRATION
                ===================================== */

                
/* =====================================
   9. SUBMIT ADMISSION TO SUPABASE
===================================== */

admissionForm.addEventListener(
    "submit",
    async function (event) {

        event.preventDefault();

        const supabase = window.malizayoSupabase;

        const submitButton =
            admissionForm.querySelector(
                'button[type="submit"]'
            );

        let uploadedAnyFile = false;

        // CHECK SIGNATURE

        if (!hasSignature) {
            message.textContent =
                "Please draw your signature before submitting.";
            message.style.display = "block";
            return;
        }

        // CHECK DECLARATION

        const declaration =
            document.getElementById("declaration");

        if (!declaration.checked) {
            message.textContent =
                "Please accept the declaration before submitting.";
            message.style.display = "block";
            return;
        }

        // CHECK DATABASE CONNECTION

        if (!supabase) {
            message.textContent =
                "Database connection unavailable. Please try again.";
            message.style.display = "block";
            return;
        }

        submitButton.disabled = true;
        submitButton.textContent = "Submitting...";

        try {

            const applicationId = crypto.randomUUID();

            const bucket = "admissions-documents";

            const uploadedPaths = {};


            // UPLOAD SUPPORTING DOCUMENTS

            const documentFields = [
                {
                    inputId: "birthCertificate",
                    column: "birth_certificate_path",
                    prefix: "birth-certificate"
                },
                {
                    inputId: "parentID",
                    column: "parent_id_path",
                    prefix: "parent-id"
                },
                {
                    inputId: "proofResidence",
                    column: "proof_residence_path",
                    prefix: "proof-residence"
                },
                {
                    inputId: "previousReport",
                    column: "previous_report_path",
                    prefix: "previous-report"
                }
            ];


            async function uploadFile(
                file,
                prefix
            ) {

                if (file.size > 5 * 1024 * 1024) {
                    throw new Error(
                        "Each document must be 5 MB or smaller."
                    );
                }

                const extension =
                    file.name.split(".").pop().toLowerCase();

                const mimeTypes = {
                    pdf: "application/pdf",
                    jpg: "image/jpeg",
                    jpeg: "image/jpeg",
                    png: "image/png"
                };

                const contentType = mimeTypes[extension];

                if (!contentType) {
                    throw new Error(
                        "Only PDF, JPG, JPEG and PNG files are accepted."
                    );
                }

                if (
                    file.type &&
                    file.type !== contentType
                ) {
                    throw new Error(
                        "The selected document type is invalid."
                    );
                }

                const filePath =
                    "applications/" +
                    applicationId +
                    "/" +
                    prefix +
                    "-" +
                    crypto.randomUUID() +
                    "." +
                    extension;

                const { data, error } =
                    await supabase.storage
                        .from(bucket)
                        .upload(
                            filePath,
                            file,
                            {
                                contentType: contentType,
                                upsert: false
                            }
                        );

                if (error) {
                    throw error;
                }

                uploadedAnyFile = true;

                return data.path;

            }


            for (const field of documentFields) {

                const input =
                    document.getElementById(
                        field.inputId
                    );

                const file = input.files[0];

                uploadedPaths[field.column] = file
                    ? await uploadFile(file, field.prefix)
                    : null;

            }


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
                                        "Could not process the signature."
                                    )
                                );
                            }

                        },
                        "image/png"
                    );

                }
            );


            const signaturePath =
                "applications/" +
                applicationId +
                "/signature.png";


            const { data: signatureData, error: signatureError } =
                await supabase.storage
                    .from(bucket)
                    .upload(
                        signaturePath,
                        signatureBlob,
                        {
                            contentType: "image/png",
                            upsert: false
                        }
                    );

            if (signatureError) {
                throw signatureError;
            }

            uploadedAnyFile = true;


            // PREPARE APPLICATION RECORD

            const application = {

                id: applicationId,

                learner_name:
                    document.getElementById("learnerName").value.trim(),

                date_of_birth:
                    document.getElementById("dateOfBirth").value,

                grade_applying_for:
                    document.getElementById("grade").value,

                previous_school:
                    document.getElementById("previousSchool").value.trim()
                    || null,

                parent_guardian_name:
                    document.getElementById("parentName").value.trim(),

                relationship_to_learner:
                    document.getElementById("relationship").value,

                parent_phone:
                    document.getElementById("parentPhone").value.trim(),

                parent_email:
                    document.getElementById("parentEmail").value.trim()
                    || null,

                residential_address:
                    document.getElementById("address").value.trim(),

                signature_name:
                    document.getElementById("signatureName").value.trim(),

                declaration_accepted: true,

                birth_certificate_path:
                    uploadedPaths.birth_certificate_path,

                parent_id_path:
                    uploadedPaths.parent_id_path,

                proof_residence_path:
                    uploadedPaths.proof_residence_path,

                previous_report_path:
                    uploadedPaths.previous_report_path,

                signature_path:
                    signatureData.path

            };


            // SAVE APPLICATION IN SUPABASE

            const { error: databaseError } =
                await supabase
                    .from("admissions")
                    .insert(application);

            if (databaseError) {
                throw databaseError;
            }


            // SUCCESS

            const reference =
                "MPS-" +
                applicationId.slice(0, 8).toUpperCase();

            message.style.display = "block";

            message.textContent =
                "DEMONSTRATION TEST SUCCESSFUL! " +
                "Application saved successfully. " +
                "Reference: " + reference +
                ". This is a test submission, not an official admission.";

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
                "Admission submission failed:",
                error
            );

            message.style.display = "block";

            message.textContent = uploadedAnyFile
                ? "The application could not be completed. Some documents may have reached private storage. Please contact the school before retrying."
                : "Application submission failed. Please check your entries and try again.";

        } finally {

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
