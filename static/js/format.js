/**
 * Format a text response fetched from the server header.
 * This function handles bold text and structures the text with HTML tags for headings and lists.
 *
 * @param {string} text - The response text fetched from the server header.
 * @returns {string} - The formatted HTML string.
 */
export function formatResponse(text) {
    // Split the text into lines for easier processing
    const lines = text.split('\n');

    // Process each line
    const formattedLines = lines.map(line => {
        // Handle bold text markers (e.g., wrapping text with asterisks `*`)
        let formattedLine = handleBold(line);

        // Format headers and subheadings
        if (line.startsWith('### ')) {
            // Main heading (Level 3)
            formattedLine = `<h3>${formattedLine.slice(4).trim()}</h3>`;
        } else if (line.startsWith('#### ')) {
            // Subheading (Level 4)
            formattedLine = `<h4>${formattedLine.slice(5).trim()}</h4>`;
        } else if (line.startsWith('##### ')) {
            // Sub-subheading (Level 5)
            formattedLine = `<h5>${formattedLine.slice(6).trim()}</h5>`;
        } else if (line.startsWith('- ')) {
            // List item
            formattedLine = `<li>${formattedLine.slice(2).trim()}</li>`;
        } else if (line.startsWith('1. ')) {
            // Ordered list item
            formattedLine = `<li>${formattedLine.slice(3).trim()}</li>`;
        }

        return formattedLine;
    });

    // Join the formatted lines into a single formatted response
    const formattedResponse = formattedLines.join('\n');

    // If there are list items, wrap them in <ul> or <ol> tags
    return wrapListItems(formattedResponse);
}

/**
 * Convert markers for bold text in the response string into HTML <strong> tags.
 * This function uses asterisks to denote bold text (e.g., *bold* becomes <strong>bold</strong>).
 *
 * @param {string} text - The text to be processed.
 * @returns {string} - The processed text with bold markers converted.
 */
function handleBold(text) {
    return text.replace(/\*(.*?)\*/g, '<strong>$1</strong>');
}

/**
 * Wrap list items with <ul> or <ol> tags based on the content.
 * This function automatically detects whether the list is ordered or unordered.
 *
 * @param {string} text - The formatted text with <li> tags.
 * @returns {string} - The text wrapped with appropriate list tags.
 */
function wrapListItems(text) {
    // Check if the text contains unordered list items
    if (text.includes('<li>')) {
        // Wrap with <ul> if unordered, <ol> if ordered
        if (text.includes('1. ')) {
            // For ordered lists
            return `<ol>${text}</ol>`;
        } else {
            // For unordered lists
            return `<ul>${text}</ul>`;
        }
    }
    return text;
}

// Example usage
const response = `To find out the change in Microsofts (MSFT) share price over the past 40 days and how it has changed in percentage terms, we need to follow these steps: ### Heading: Step-by-Step Calculation using Excel Data 1. **Identify the dates:** - Determine the latest date available in the provided documents. - Count back 40 trading days (not calendar days, as stock markets operate only on weekdays). 2. **Extract Prices:** - Extract the closing share price for the latest date. - Extract the closing share price 40 days prior. 3. **Calculate the Percentage Change:** - Use the formula for percentage change: \[ \text{Percentage Change} = \left( \frac{\text{Price Today} - \text{Price 40 Days Ago}}{\text{Price 40 Days Ago}} \right) \times 100 \] ### Step-by-Step Guide #### Step 1: Identify the latest date and the date 40 trading days earlier Looking at the provided documents, the date progression starts from March 14, 2014, to recent dates. Assume the latest date in the given dataset is June 5, 2014 (from the last document). To find 40 trading days earlier, we list trading dates backward. #### Step 2: Extract Prices - **Latest date closing price:** From June 5, 2014: - Close Price on 2014-06-05 is $41.21 - **40 Trading days earlier closing price:** - 40 trading days back from June 5, 2014, considering trading days only (excludes weekends and holidays), can be approximated to around mid-April. Hence checking the data for early April: - Close Price on 2014-04-17 (approx. 40 trading days back) is $40.01 #### Step 3: Perform the Calculation - **Latest Price (P1):** 41.21 (on 2014-06-05) - **Price 40 Days Ago (P0):** 40.01 (on 2014-04-17) \[ \text{Percentage Change} = \left( \frac{41.21 - 40.01}{40.01} \right) \times 100 \] \[ \text{Percentage Change} = \left( \frac{1.20}{40.01} \right) \times 100 \] \[ \text{Percentage Change} = 0.02999 \times 100 \] \[ \text{Percentage Change} = 2.999 \% \] Thus, Microsoft's share price has increased by approximately 3.0% over the past 40 trading days. ### Final Answer: - **Microsoft's share price 40 days ago was $40.01.** - **It has changed by approximately 3.0% compared to today's price of $41.21.**
`;

console.log(formatResponse(response));
