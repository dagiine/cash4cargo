const METHODS = [
      {
        icon:  '',
        name:  'Air Express',
        time:  '3–5 Business Days',
        price: '$12.50',
      },
      {
        icon:  '',
        name:  'Standard Cargo',
        time:  '7–10 Business Days',
        price: '$8.00',
      },
    ];

    const methodsBody = document.getElementById('methods-body');
    methodsBody.innerHTML = '';         

    METHODS.forEach(function(m) {
      const row = document.createElement('div');
      row.className = 'sh-row';
      row.setAttribute('role', 'row');
      row.innerHTML =
        '<span class="sh-row__name">' +
          '<span class="sh-row__icon">' + m.icon + '</span>' +
          m.name +
        '</span>' +
        '<span class="sh-row__time">'  + m.time  + '</span>' +
        '<span class="sh-row__price">' + m.price + '</span>' +
        '<span class="sh-row__action">' +
          '<button class="btn" type="button">Select</button>' +
        '</span>';
      methodsBody.appendChild(row);
    });


    /* ── 2. Prohibited items data ─────────────── */
    const PROHIBITED = [
      { label: 'Explosives & Flammables',  sub: 'Fireworks, fuel, lighter fluid, matches.' },
      { label: 'Dangerous Chemicals',       sub: 'Corrosives, poisons, radioactive material.' },
      { label: 'Live Animals & Plants',     sub: 'Pets, livestock, restricted seeds, soil.' },
      { label: 'Illegal Substances',        sub: 'Narcotics, counterfeit goods, weapons.' },
      { label: 'Valuable Assets',           sub: 'Cash, bullion, precious stones, bonds.' },
      { label: 'Lithium Batteries',         sub: 'Certain standalone power banks and cells.' },
    ];

    const grid = document.getElementById('prohibited-grid');
    grid.innerHTML = '';                 

    PROHIBITED.forEach(function(p) {
      const card = document.createElement('div');
      card.className = 'prohibited-card';
      card.innerHTML =
        '<div class="prohibited-card__header">' +
          '<span class="prohibited-label">' + p.label + '</span>' +
        '</div>' +
        '<p class="prohibited-sub">' + p.sub + '</p>';
      grid.appendChild(card);
    });


    
    document.getElementById('calc-form').addEventListener('submit', function(e) {
      e.preventDefault();

      var w  = parseFloat(document.getElementById('sh-weight').value) || 0;
      var l  = parseFloat(document.getElementById('sh-length').value) || 0;
      var wd = parseFloat(document.getElementById('sh-width').value)  || 0;
      var h  = parseFloat(document.getElementById('sh-height').value) || 0;

      var volWeight  = (l * wd * h) / 5000;
      var chargeable = Math.max(w, volWeight);
      var ratePerKg  = 8.00;                           
      var total      = (chargeable * ratePerKg).toFixed(2);

      var resultEl = document.getElementById('calc-result');

      if (chargeable === 0) {
        resultEl.innerHTML = '';
        return;
      }

      resultEl.innerHTML =
            '<div class="calc-result-inner">' +
            '<h3>Estimated Cost</h3>' +
            '<div class="calc-rows">' +
                '<div class="calc-row">' +
                '<span>Actual weight</span>' +
                '<span>' + w.toFixed(1) + ' kg</span>' +
                '</div>' +
                '<div class="calc-row">' +
                '<span>Volumetric weight</span>' +
                '<span>' + volWeight.toFixed(2) + ' kg</span>' +
                '</div>' +
                '<div class="calc-row">' +
                '<span>Chargeable weight</span>' +
                '<span>' + chargeable.toFixed(2) + ' kg</span>' +
                '</div>' +
                '<div class="calc-row">' +
                '<span>Rate (Standard)</span>' +
                '<span>$' + ratePerKg.toFixed(2) + ' / kg</span>' +
                '</div>' +
                '<div class="calc-row total">' +
                '<span>Total estimate</span>' +
                '<span>$' + total + '</span>' +
                '</div>' +
            '</div>' +
            '</div>';
    });