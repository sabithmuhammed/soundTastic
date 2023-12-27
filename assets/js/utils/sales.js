function padTo2Digits(num) {
    return num.toString().padStart(2, "0");
  }
  function formatDate(date) {
    return (
      [
        date.getFullYear(),
        padTo2Digits(date.getMonth() + 1),
        padTo2Digits(date.getDate()),
      ].join("-") +
      " " +
      [
        padTo2Digits(date.getHours()),
        padTo2Digits(date.getMinutes()),
        // padTo2Digits(date.getSeconds()),  // 👈️ can also add seconds
      ].join(":")
    );
  }

  const fDate = new Date();
  fDate.setDate(fDate.getDate() - 1);
  const tDate = new Date();
  const [fromDate] = formatDate(fDate).split(" ");
  const [toDate] = formatDate(tDate).split(" ");
  document.querySelector("#from-date").value = fromDate;
  document.querySelector("#to-date").value = toDate;

  const generateReport = async () => {
    try {
      const from = document.querySelector("#from-date").value;
      const to = document.querySelector("#to-date").value;
      const rawData = await fetch(
        `/admin/generate-report?from=${from}&to=${to}`
      );
      if (rawData.ok) {
        const data = await rawData.json();
        if (data.status === "success") {
          const { salesReport } = data;
          const table = document.querySelector("#report-table");
          const rowCount = table.rows.length;

          // Start removing rows from the bottom to avoid index issues
          for (let i = rowCount - 1; i > 0; i--) {
            table.deleteRow(i);
          }
          salesReport.forEach((item) => {
            let row = table.insertRow(-1); // We are adding at the end

            // Create table cells
            let c1 = row.insertCell(0);
            let c2 = row.insertCell(1);
            let c3 = row.insertCell(2);
            let c4 = row.insertCell(3);
            let c5 = row.insertCell(4);
            let c6 = row.insertCell(5);
            let c7 = row.insertCell(6);
            let c8 = row.insertCell(7);
            let c9 = row.insertCell(8);

            const { name, mobile, address, city, state, pincode } =
              item.address;
             const quantity = item.products.reduce((acc,{quantity})=>{
                return acc+quantity
             },0)
            // Add data to c1 and c2
            c1.innerText = item.invoiceNo;
            c2.innerHTML = `${name}<br>${mobile}`;
            c3.innerText = item.status;

            c4.innerHTML = `${address}<br>${city}<br>${state}<br>${pincode}`;
            c5.innerText =  new Date(item.orderDate).toLocaleString('en-AU',{year:"numeric",month:"2-digit",day:"2-digit"});
            c6.innerText = quantity;
            c7.innerText = item.payment;
            c8.innerText = item.paymentStatus;
            c9.innerText =item.finalAmount.$numberDecimal;
          });
        }
        if(salesReport.length){
            document.querySelectorAll(".btn").forEach((item)=>{
                item.classList.remove("disabled")
            })
        }
        
      }
    } catch (error) {
      console.log(error.message);
    }
  };
  function tableToCSV() {
 
    // Variable to store the final csv data
    let csv_data = [];

    // Get each row data
    let rows = document.getElementsByTagName('tr');
    for (let i = 0; i < rows.length; i++) {

        // Get each column data
        let cols = rows[i].querySelectorAll('td,th');

        // Stores each csv row data
        let csvrow = [];
        for (let j = 0; j < cols.length; j++) {

            // Get the text data of each cell
            // of a row and push it to csvrow
            csvrow.push(cols[j].innerHTML);
        }

        // Combine each column value with comma
        csv_data.push(csvrow.join(","));
    }

    // Combine each row data with new line character
    csv_data = csv_data.join('\n');

    // Call this function to download csv file  
    downloadCSVFile(csv_data);

}

function downloadCSVFile(csv_data) {

    // Create CSV file object and feed
    // our csv_data into it
    CSVFile = new Blob([csv_data], {
        type: "text/csv"
    });

    // Create to temporary link to initiate
    // download process
    let temp_link = document.createElement('a');

    // Download csv file
    temp_link.download = "sales-report.csv";
    let url = window.URL.createObjectURL(CSVFile);
    temp_link.href = url;

    // This link should not be displayed
    temp_link.style.display = "none";
    document.body.appendChild(temp_link);

    // Automatically click the link to
    // trigger download
    temp_link.click();
    document.body.removeChild(temp_link);
}

function generatePDF() {
    // Create a new jsPDF instance
    var doc = new jsPDF();

    // Add content to the PDF
    doc.setFontSize(12); // Set font size to 12 (adjust as needed)
    doc.text('Sales Report', 10, 10);

    // Get the table element by its ID
    var table = document.getElementById('report-table');

    // Use jsPDF AutoTable plugin to add the table to the PDF
    doc.autoTable({
        head: [Array.from(table.rows[0].cells).map(cell => cell.innerText)], // Header row
        body: Array.from(table.rows).slice(1).map(row =>
            Array.from(row.cells).map(cell => cell.innerText)
        ), // Data rows
        startY: 20, // Start the table at position 20 (adjust as needed)
        margin: { top: 20 }, // Add margin at the top (adjust as needed)
        styles: { fontSize: 10 }, // Set font size for the entire table (adjust as needed)
        columnStyles: { 2: { cellWidth: 'auto' } } // Set cell width for the third column to auto
    });

    // Save the PDF
    doc.save('sales-report.pdf');
}



  document
    .querySelector("[data-btn-generate]")
    .addEventListener("click", generateReport);