import React from "react";

const Instructions = () => {
  return (
    <div className="bg-gray-900 text-white w-full p-4 box-border">
      <div className="p-4 max-w-4xl">
        <h2 className="text-xl font-bold mb-4">Instructions</h2>
        <h3 className="text-lg font-semibold mb-4">
          Detailed Instructions for Workers
        </h3>
        <p className="mb-4">
          <strong>Objective:</strong> Your task is to create prompts and
          human-written answers with supporting facts based on 10-K and 10-Q
          reports.
        </p>
        <h4 className="text-md font-semibold mb-2">Steps:</h4>
        <ol className="list-decimal list-inside mb-4">
          <li className="mb-2">
            <strong>Finding Reports:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>
                Go to the SEC EDGAR Company Search page:{" "}
                <a
                  href="https://www.sec.gov/edgar/searchedgar/companysearch"
                  className="text-blue-500"
                >
                  SEC EDGAR Search
                </a>
              </li>
              <li>
                Search for companies and filter the results to find 10-K or 10-Q
                reports from October 2023 or more recent.
              </li>
              <li>Select the report and open it as HTML.</li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Downloading PDFs:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>
                Click &#39;Menu&#39; on the SEC page with the 10-K/10-Q report.
              </li>
              <li>Click &#39;Open as HTML.&#39;</li>
              <li>Write down the link to the HTML version.</li>
              <li>
                Click &#39;Print&#39; and set the destination to &#39;Save as
                PDF&#39; to save the PDF file.
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Creating Prompts:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>
                Read through the report and generate prompts/questions that fall
                into one of the following categories:
              </li>
              <ul className="list-disc list-inside ml-8">
                <li>Category A: Simple questions about a single document.</li>
                <li>
                  Category B: Complex questions about a single document that
                  require multiple parts/paragraphs from the report or inferring
                  information.
                </li>
                <li>
                  Category C: Complex questions that require using information
                  from multiple reports (up to 40 reports), for example, reports
                  from companies in a similar sector.
                </li>
              </ul>
              <li>
                Ensure that prompts ask for factual information with support in
                the documents. Avoid opinion-based questions unless they are
                stated in the documents.
              </li>
            </ul>
          </li>
          <li className="mb-2">
            <strong>Writing Answers:</strong>
            <ul className="list-disc list-inside ml-4">
              <li>Provide a human-written answer to each prompt.</li>
              <li>
                Include any supporting facts needed to answer the question
                accurately.
              </li>
              <li>
                Ensure that answers are clear, concise, and free from any PII.
              </li>
            </ul>
          </li>
        </ol>
        <h4 className="text-md font-semibold mb-2">
          Example Prompts, Answers, and Supporting Facts:
        </h4>
        <div className="mb-4">
          <p>
            <strong>Prompt (Category A):</strong> What was the total revenue
            reported by the company in the latest 10-Q filing?
          </p>
          <p>
            <strong>Answer:</strong> The total revenue reported by the company
            in the latest 10-Q filing was $10 million.
          </p>
          <p>
            <strong>Supporting Facts:</strong> According to the 10-Q report, the
            total revenue for the quarter ending December 31, 2023, was $10
            million.
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Prompt (Category B):</strong> How did the company&#39;s net
            income change compared to the previous quarter?
          </p>
          <p>
            <strong>Answer:</strong> The company&#39;s net income increased by
            $2 million compared to the previous quarter.
          </p>
          <p>
            <strong>Supporting Facts:</strong> The 10-Q report states that the
            net income for the current quarter is $5 million, whereas the net
            income for the previous quarter was $3 million.
          </p>
        </div>
        <div className="mb-4">
          <p>
            <strong>Prompt (Category C):</strong> Compare the R&D expenses of
            the company with two other companies in the same sector for the
            latest fiscal year.
          </p>
          <p>
            <strong>Answer:</strong> The company&#39;s R&D expenses were $15
            million, while Company B&#39;s R&D expenses were $12 million and
            Company C&#39;s were $18 million.
          </p>
          <p>
            <strong>Supporting Facts:</strong> According to the 10-K reports of
            the respective companies, the R&D expenses for the latest fiscal
            year are as follows: Company A: $15 million, Company B: $12 million,
            Company C: $18 million.
          </p>
        </div>
      </div>
    </div>
  );
};

export default Instructions;
