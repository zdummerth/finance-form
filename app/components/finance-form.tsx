"use client";
import { useState, useRef, useEffect } from "react";

type StateErrors = {
  answer: string[];
  prompt: string[];
  [key: `documents.${number}.datePublished`]: string[];
  [key: `documents.${number}.file`]: string[];
  [key: `documents.${number}.secPageLink`]: string[];
};

const initialState = { message: null, errors: {} as StateErrors };

const SubmitButton = ({ pending }: { pending: boolean }) => (
  <button
    type="submit"
    className="bg-blue-500 hover:bg-blue-600 text-white rounded px-4 py-2 mt-2 w-full"
    disabled={pending}
  >
    {pending ? "Submitting..." : "Submit"}
  </button>
);

function ErrorMessage({ state, field }: { state: any; field: string }) {
  return (
    <div
      id={`${field}-error`}
      aria-live="polite"
      aria-atomic="true"
      className="text-red-500"
    >
      {state.errors?.[field] &&
        state.errors[field].map((error: string) => (
          <p className="mt-2 text-sm" key={error}>
            {error}
          </p>
        ))}
    </div>
  );
}

const validateField = (name: string, value: string) => {
  const errors: string[] = [];
  const phonePattern = /(\+?1\s?)?(\(?\d{3}\)?[-.\s]?\d{3}[-.\s]?\d{4}|\d{10})/;
  const ssnPattern = /\b\d{3}[-.\s]?\d{2}[-.\s]?\d{4}\b/;
  const secUrlPattern = /^https:\/\/www\.sec\.gov\//;
  const piiPatterns = [phonePattern, ssnPattern];

  if (name === "prompt" || name === "answer") {
    if (value.length < 10) {
      errors.push(`${name} must be at least 10 characters`);
    }
    piiPatterns.forEach((pattern) => {
      if (pattern.test(value)) {
        errors.push(`${name} may contain PII`);
      }
    });
  }

  if (name === "secPageLink") {
    if (!secUrlPattern.test(value)) {
      errors.push("Link must start with https://www.sec.gov/");
    }
  }

  if (name === "datePublished") {
    const date = new Date(value);
    const minDate = new Date("2023-10-01");
    if (date < minDate) {
      errors.push("Date must be after October 2023");
    }
  }

  return errors;
};

export default function DataPointForm() {
  const [state, setState] = useState(initialState);
  const [pending, setPending] = useState(false);
  const [mayContainPII, setMayContainPII] = useState(false);
  console.log("errors", state.errors);

  const [formData, setFormData] = useState({
    prompt: "",
    answer: "",
    supportingFacts: [{ fact: "", source: "" }],
    documents: [
      { secPageLink: "", datePublished: "", file: null as File | null },
    ],
  });

  const promptRef = useRef<HTMLTextAreaElement>(null);
  const answerRef = useRef<HTMLTextAreaElement>(null);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({
      ...prevData,
      [name]: value,
    }));
    const errors = validateField(name, value);
    setState((prevState) => ({
      ...prevState,
      errors: { ...prevState.errors, [name]: errors },
    }));
  };

  const handleSupportingFactChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value } = e.target;
    const newSupportingFacts = formData.supportingFacts.map((fact, i) => {
      if (i === index) {
        return { ...fact, [name]: value };
      }
      return fact;
    });
    setFormData({ ...formData, supportingFacts: newSupportingFacts });
    const errors = validateField(name, value);
    setState((prevState) => ({
      ...prevState,
      errors: {
        ...prevState.errors,
        [`supportingFacts.${index}.${name}`]: errors,
      },
    }));
  };

  const handleDocumentChange = (
    index: number,
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const { name, value, files } = e.target;
    const newDocuments = formData.documents.map((doc, i) => {
      if (i === index) {
        return { ...doc, [name]: files ? files[0] : value };
      }
      return doc;
    });
    setFormData({ ...formData, documents: newDocuments });
    const errors = validateField(name, value);
    setState((prevState) => ({
      ...prevState,
      errors: { ...prevState.errors, [`documents.${index}.${name}`]: errors },
    }));
  };

  const addSupportingFact = () => {
    setFormData((prevData) => ({
      ...prevData,
      supportingFacts: [...prevData.supportingFacts, { fact: "", source: "" }],
    }));
  };

  const removeSupportingFact = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this supporting fact?"
    );
    if (!confirmed) return;
    const newSupportingFacts = formData.supportingFacts.filter(
      (_, i) => i !== index
    );
    setFormData({ ...formData, supportingFacts: newSupportingFacts });
  };

  const addDocument = () => {
    setFormData((prevData) => ({
      ...prevData,
      documents: [
        ...prevData.documents,
        { secPageLink: "", datePublished: "", file: null },
      ],
    }));
  };

  const removeDocument = (index: number) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this document?"
    );
    if (!confirmed) return;
    const newDocuments = formData.documents.filter((_, i) => i !== index);
    setFormData({ ...formData, documents: newDocuments });
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setPending(true);

    // Get errors from state
    const { prompt: promptErrors, answer: answerErrors } = state.errors;
    const hasPIIErrors =
      (promptErrors || []).some((error) => error.includes("may contain PII")) ||
      (answerErrors || []).some((error) => error.includes("may contain PII"));

    const documentErrors = formData.documents.reduce(
      (acc, doc, index) => {
        const docErrors: any = {
          secPageLink: state.errors?.[`documents.${index}.secPageLink`] || [],
          datePublished:
            state.errors?.[`documents.${index}.datePublished`] || [],
          file: state.errors?.[`documents.${index}.file`] || [],
        };
        return {
          secPageLink: acc.secPageLink.concat(docErrors.secPageLink),
          datePublished: acc.datePublished.concat(docErrors.datePublished),
          file: acc.file.concat(docErrors.file),
        };
      },
      { secPageLink: [], datePublished: [], file: [] }
    );

    const hasDocumentErrors = Object.values(documentErrors).some(
      (errors) => errors.length
    );

    if ((promptErrors?.length || answerErrors?.length) && !hasDocumentErrors) {
      if (
        hasPIIErrors &&
        (!promptErrors.length ||
          promptErrors.every((error) => error.includes("may contain PII"))) &&
        (!answerErrors.length ||
          answerErrors.every((error) => error.includes("may contain PII")))
      ) {
        const userConfirmed = window.confirm(
          "The prompt or answer may contain PII. Do you confirm that it does not contain PII?"
        );

        if (userConfirmed) {
          setMayContainPII(true);
        } else {
          setPending(false);
          return;
        }
      } else {
        alert("The form contains errors. Please fix them before submitting.");
        setPending(false);
        return;
      }
    }

    // Alert the form data including file details
    const fileDetails = formData.documents.map((doc) => ({
      secPageLink: doc.secPageLink,
      datePublished: doc.datePublished,
      file: doc.file
        ? { name: doc.file.name, size: doc.file.size, type: doc.file.type }
        : null,
    }));
    alert(JSON.stringify({ ...formData, documents: fileDetails }, null, 2));

    // Simulate form submission delay
    setTimeout(() => {
      setPending(false);
      setState(initialState); // Reset state after submission
      setMayContainPII(false); // Reset PII state
      setFormData({
        prompt: "",
        answer: "",
        supportingFacts: [{ fact: "", source: "" }],
        documents: [{ secPageLink: "", datePublished: "", file: null }],
      });
    }, 1000);
  };

  useEffect(() => {
    if (promptRef.current) {
      promptRef.current.style.height = "auto";
      promptRef.current.style.height = `${promptRef.current.scrollHeight}px`;
    }
    if (answerRef.current) {
      answerRef.current.style.height = "auto";
      answerRef.current.style.height = `${answerRef.current.scrollHeight}px`;
    }
  }, [formData.prompt, formData.answer]);

  return (
    <>
      <form
        onSubmit={handleSubmit}
        className="border border-gray-800 border-t-0 p-4 bg-gray-900 text-white w-full flex flex-wrap lg:h-screen p-4 box-border"
      >
        <div className="w-full lg:w-1/2 p-2 lg:pr-4 border-r-[1px] overflow-y-auto h-full box-border">
          {/* Prompt */}
          <div className="mb-4">
            <label htmlFor="prompt" className="mb-2 block text-sm font-medium">
              Prompt
            </label>
            <div className="relative mt-2 rounded-md">
              <textarea
                ref={promptRef}
                id="prompt"
                name="prompt"
                placeholder="Enter prompt"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-gray-800 text-white"
                aria-describedby="prompt-error"
                value={formData.prompt}
                onChange={handleChange}
                rows={1}
                style={{ resize: "none", overflow: "hidden" }}
                required
              />
              <ErrorMessage state={state} field="prompt" />
            </div>
          </div>

          {/* Answer */}
          <div className="mb-4">
            <label htmlFor="answer" className="mb-2 block text-sm font-medium">
              Answer
            </label>
            <div className="relative mt-2 rounded-md">
              <textarea
                ref={answerRef}
                id="answer"
                name="answer"
                placeholder="Enter answer"
                className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 bg-gray-800 text-white"
                aria-describedby="answer-error"
                value={formData.answer}
                onChange={handleChange}
                rows={1}
                style={{ resize: "none", overflow: "hidden" }}
                required
              />
              <ErrorMessage state={state} field="answer" />
            </div>
          </div>
        </div>

        <div className="w-full lg:w-1/2 p-2 lg:pl-4 overflow-y-auto h-full box-border">
          {/* Supporting Facts */}
          <div className="mb-4">
            <label
              htmlFor="supportingFacts"
              className="mb-2 block text-sm font-medium"
            >
              Supporting Facts
            </label>
            {formData.supportingFacts.map((fact, index) => (
              <div
                key={index}
                className="relative mt-2 rounded-md mb-4 border p-4"
              >
                <label className="block text-sm font-medium mb-1">Fact</label>
                <input
                  name="fact"
                  placeholder="Enter fact"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 mb-2 bg-gray-800 text-white"
                  value={fact.fact}
                  onChange={(e) => handleSupportingFactChange(index, e)}
                  required
                />
                <ErrorMessage
                  state={state}
                  field={`supportingFacts.${index}.fact`}
                />

                <label className="block text-sm font-medium mb-1">Source</label>
                <input
                  name="source"
                  placeholder="Enter source"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 mb-2 bg-gray-800 text-white"
                  value={fact.source}
                  onChange={(e) => handleSupportingFactChange(index, e)}
                  required
                />
                <ErrorMessage
                  state={state}
                  field={`supportingFacts.${index}.source`}
                />

                {formData.supportingFacts.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeSupportingFact(index)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 mt-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addSupportingFact}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded px-4 py-2 mt-2"
            >
              Add Supporting Fact
            </button>
            <ErrorMessage state={state} field="supportingFacts" />
          </div>

          {/* Documents */}
          <div className="mb-4">
            <label
              htmlFor="documents"
              className="mb-2 block text-sm font-medium"
            >
              Documents
            </label>
            {formData.documents.map((doc, index) => (
              <div
                key={index}
                className="relative mt-2 rounded-md mb-4 border p-4"
              >
                <label className="block text-sm font-medium mb-1">
                  Link to SEC Page
                </label>
                <input
                  name="secPageLink"
                  placeholder="Link to SEC page"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 mb-2 bg-gray-800 text-white"
                  value={doc.secPageLink}
                  onChange={(e) => handleDocumentChange(index, e)}
                  required
                />
                <ErrorMessage
                  state={state}
                  field={`documents.${index}.secPageLink`}
                />

                <label className="block text-sm font-medium mb-1">
                  Date Published
                </label>
                <input
                  name="datePublished"
                  placeholder="Date Published"
                  type="date"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 mb-2 bg-gray-800 text-white"
                  value={doc.datePublished}
                  onChange={(e) => handleDocumentChange(index, e)}
                  required
                />
                <ErrorMessage
                  state={state}
                  field={`documents.${index}.datePublished`}
                />

                <label className="block text-sm font-medium mb-1">
                  Upload PDF
                </label>
                <input
                  name="file"
                  type="file"
                  accept="application/pdf"
                  className="peer block w-full rounded-md border border-gray-200 py-2 pl-4 text-sm outline-2 placeholder:text-gray-500 mb-2 bg-gray-800 text-white"
                  onChange={(e) => handleDocumentChange(index, e)}
                  required
                />
                <ErrorMessage state={state} field={`documents.${index}.file`} />

                {formData.documents.length > 1 && (
                  <button
                    type="button"
                    onClick={() => removeDocument(index)}
                    className="bg-red-500 hover:bg-red-600 text-white rounded px-4 py-2 mt-2"
                  >
                    Delete
                  </button>
                )}
              </div>
            ))}
            <button
              type="button"
              onClick={addDocument}
              className="bg-gray-500 hover:bg-gray-600 text-white rounded px-4 py-2 mt-2"
            >
              Add Document
            </button>
          </div>
          <SubmitButton pending={pending} />
        </div>
      </form>
    </>
  );
}
