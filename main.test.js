import {
  getByText,
  getByPlaceholderText,
  getByRole,
  fireEvent,
} from '@testing-library/dom';
import '@testing-library/jest-dom/extend-expect';
import userEvent from '@testing-library/user-event';

import { init } from './grocery-list-with-callback';

function getDOMTemplate() {
  const div = document.createElement('div');
  div.innerHTML = `
    <form>
      <input placeholder="dodaj do listy" type="text" class="add-input" />
      <button class="add-button" type="submit">
        <i class="fas fa-plus"></i>
      </button>
      <div class="select">
        <select name="filters" class="filter-options">
          <option value="all">Wszystkie</option>
          <option value="completed">Kupione</option>
          <option value="uncompleted">Niekupione</option>
        </select>
      </div>
    </form>
    <section id="grocery-list-root">
      <ul class="grocery-list"></ul>
    </section>
  `;
  init(div);

  return div;
}

test('should add new item to list', async () => {
  const item = 'chleb';
  const container = getDOMTemplate();
  const input = getByPlaceholderText(container, 'dodaj do listy');

  fireEvent.change(input, { target: { value: item } });

  getByRole(container, 'button').click();
  expect(getByText(container, item)).toHaveTextContent(item);
  expect(container).toMatchSnapshot();
});

test('should hide uncompleted item after filter select', async () => {
  const item = 'chleb';
  const container = getDOMTemplate();
  const input = getByPlaceholderText(container, 'dodaj do listy');
  fireEvent.change(input, { target: { value: item } });
  getByRole(container, 'button').click();

  userEvent.selectOptions(getByRole(container, 'combobox'), 'completed');

  expect(getByText(container, item)).toHaveTextContent(item);
  expect(container).toMatchSnapshot();
});
