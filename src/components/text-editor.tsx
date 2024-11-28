import { useEffect, useRef, useState } from "react";
import ReactQuill from "react-quill";
import { doc, getDoc, setDoc, onSnapshot } from "firebase/firestore";
import "react-quill/dist/quill.snow.css";
import { throttle } from "lodash";
import { db } from "../firebase-config";
import "../App.css";

export const TextEditor = () => {
    const [isEditing, setIsEditing] = useState<boolean>(false);
    const quillRef = useRef<ReactQuill | null>(null); // ReactQuill reference
    const documentRef = doc(db, "documents", "example-doc");
    const isLocalChange = useRef<boolean>(false); // Track local user changes

    // Save content to Firestore with throttle
    const saveContent = throttle(() => {
        if (quillRef.current) {
            const editor = quillRef.current.getEditor();
            if (isLocalChange.current) {
                const content = editor.getContents();
                console.log("Saving content to Firestore:", content);
                setDoc(documentRef, { content: content.ops }, { merge: true })
                    .then(() => console.log("Content saved successfully"))
                    .catch(console.error);
                isLocalChange.current = false;
            }
        }
    }, 1000);

    useEffect(() => {
        const loadInitialContent = async () => {
            if (quillRef.current) {
                try {
                    const docSnap = await getDoc(documentRef);
                    if (docSnap.exists()) {
                        const savedContent = docSnap.data()?.content;
                        if (savedContent) {
                            quillRef.current.getEditor().setContents(savedContent);
                        }
                    } else {
                        console.log("No document found, starting with an empty editor.");
                    }
                } catch (error) {
                    console.error("Error loading document:", error);
                }
            }
        };

        const setupRealtimeListener = () => {
            return onSnapshot(documentRef, (snapshot) => {
                if (snapshot.exists()) {
                    const newContent = snapshot.data()?.content;
                    if (!isEditing && quillRef.current) {
                        const editor = quillRef.current.getEditor();
                        const currentCursorPosition = editor.getSelection()?.index || 0;

                        // Update content without triggering text-change
                        editor.setContents(newContent, "silent");
                        editor.setSelection(currentCursorPosition);
                    }
                }
            });
        };

        const setupEditorListeners = () => {
            if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                editor.on("text-change", (_, __, source) => {
                    if (source === "user") {
                        isLocalChange.current = true;
                        setIsEditing(true);
                        saveContent();

                        // Reset editing state after 5 seconds of inactivity
                        setTimeout(() => setIsEditing(false), 5000);
                    }
                });
            }
        };

        loadInitialContent();
        const unsubscribe = setupRealtimeListener();
        setupEditorListeners();

        return () => {
            unsubscribe();
            if (quillRef.current) {
                const editor = quillRef.current.getEditor();
                editor.off("text-change");
            }
        };
    }, []);

    return (
        <div className="google-docs-editor">
            <ReactQuill ref={quillRef} />
        </div>
    );
};
