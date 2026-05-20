export default function DetailTrack() {
  return (
    <main className="container">
      {/* LEFT SIDE */}
      <section className="shipment-progress">
        <h2>Shipment Progress</h2>

        <article>
          <h3>Received in China</h3>
          <p>Guangzhou Sorting Center</p>
          <time>Oct 12, 2023 - 09:30 AM</time>
        </article>

        <article>
          <h3>Inspected</h3>
          <p>Quality check and documentation verified</p>
          <time>Oct 13, 2023 - 02:15 PM</time>
        </article>

        <article>
          <h3>Consolidated</h3>
          <p>Packed into Container #CN-MN-882</p>
          <time>Oct 14, 2023 - 11:00 AM</time>
        </article>

        <article className="active">
          <h3>In Transit</h3>
          <p>Crossing border at Erlian - Zamyn-Uud</p>
          <time>Oct 15, 2023 - 08:00 AM</time>
        </article>

        <article>
          <h3>Delivered in Mongolia</h3>
          <p>Ulaanbaatar Distribution Point</p>
        </article>
      </section>

      {/* RIGHT SIDE */}
      <aside>
        <section className="shipment-details">
          <h2>Shipment Details</h2>
          <p><strong>Package Type:</strong> Standard Carton</p>
          <p><strong>Weight:</strong> 12.50 kg</p>
          <p><strong>Dimensions:</strong> 40 × 30 × 25 cm</p>
          <p><strong>Consignee:</strong> Batchuluun M.</p>
        </section>

        <section className="pricing-summary">
          <h2>Pricing Summary</h2>
          <p>Base Freight: $45.00</p>
          <p>Consolidation Fee: $5.00</p>
          <p>Insurance: $2.50</p>
          <hr />
          <h3>Total: $52.50</h3>
        </section>
      </aside>
    </main>
  );
}