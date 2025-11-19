export default function decorate(block) {

  const row = block.querySelector(":scope > div");
  if (!row) return;

  const items = [...row.children]; // 4 inner divs


  const container = document.createElement("div");
  container.className = "container";


  const wrapper = document.createElement("div");
  wrapper.className = "row align-items-center";


  // const col1 = document.createElement("div");
  // col1.className = "col-md-4 copyright opacity-50";
  // col1.append(items[0]);
  // wrapper.append(col1);


  const col2 = document.createElement("div");
  col2.className =
    "col-md-3 d-flex justify-content-center align-items-center logo fw-medium gap-3";
  const span = document.createElement("span");
  span.textContent = "SECURED BY:";
  col2.append(span);
  col2.append(items[1]);

  wrapper.append(col2);


  const col3 = document.createElement("div");
  col3.className = "col-md-5 links";
  col3.append(items[2]);
  wrapper.append(col3);


  container.append(wrapper);

  //row.remove();

  block.append(container);

  // if (items[3]) items[3].remove();
}

