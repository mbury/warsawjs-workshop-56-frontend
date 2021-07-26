export function init(view) {
  const mountNode = view || document;

  const store = getGroceryListStore();

  store.addItem('ser');
  store.addItem('chleb');

  const addInput = mountNode.querySelector('.add-input');
  const addButton = mountNode.querySelector('.add-button');
  const groceryList = mountNode.querySelector('.grocery-list');
  const filterOption = mountNode.querySelector('.filter-options');

  addButton.addEventListener('click', addItemHandler);
  document.addEventListener('DOMContentLoaded', initHandler);
  filterOption.addEventListener('change', selectFilterHandle);

  function addItemHandler(e) {
    e.preventDefault();

    store.addItem(addInput.value, (itemData) => {
      const newItemNode = getItemNodeFrom(itemData);
      groceryList.appendChild(newItemNode);
      addInput.value = '';
    });
  }

  function selectFilterHandle(e) {
    const checklist = groceryList.childNodes;
    checklist.forEach(function (item) {
      switch (e.target.value) {
        case 'all':
          item.style.display = 'flex';
          break;
        case 'completed':
          if (item.classList.contains('completed')) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
          break;
        case 'uncompleted':
          if (!item.classList.contains('completed')) {
            item.style.display = 'flex';
          } else {
            item.style.display = 'none';
          }
      }
    });
  }

  function initHandler() {
    const data = store.getState();

    data.groceryList.forEach(function (item) {
      const newItem = getItemNodeFrom(item);

      groceryList.appendChild(newItem);
    });
  }

  function getItemNodeFrom(item) {
    const newItem = document.createElement('li');
    newItem.classList.add('grocery-list-item');

    const text = document.createElement('span');
    text.textContent = item.text;

    text.classList.add('grocery-list-item-text');
    newItem.appendChild(text);

    const completedButton = document.createElement('button');
    completedButton.innerHTML = `<i class="fas fa-check"></i>`;
    completedButton.classList.add('complete-btn');
    completedButton.addEventListener('click', () =>
      store.completeItem(item.id, () => newItem.classList.toggle('completed'))
    );
    newItem.appendChild(completedButton);

    const deleteButton = document.createElement('button');
    deleteButton.innerHTML = `<i class="fas fa-trash"></i>`;
    deleteButton.classList.add('delete-btn');
    deleteButton.addEventListener('click', () =>
      store.deleteItem(item.id, () => newItem.remove())
    );
    newItem.appendChild(deleteButton);
    return newItem;
  }
}

function getGroceryListStore(initState) {
  const store = {};
  store.state = { groceryList: initState || [] };
  store.getState = () => store.state;
  store.addItem = (text, callback) => {
    const newGroceryItem = {
      id: new Date(),
      text: text,
      completed: false,
    };
    const newGroceryList = [...store.state.groceryList, newGroceryItem];
    const nextState = { groceryList: newGroceryList };
    store.state = nextState;

    if (callback) {
      callback(newGroceryItem);
    }
  };

  store.deleteItem = (id, callback) => {
    const groceryList = store.state.groceryList.filter((i) => {
      return i.id !== id;
    });

    const nextState = {
      groceryList,
    };

    store.state = nextState;

    if (callback) {
      callback();
    }
  };

  store.completeItem = (id, callback) => {
    const groceryList = store.state.groceryList.map((i) => {
      if (i.id === id) {
        return { ...i, completed: !i.completed };
      }
      return i;
    });

    const nextState = {
      groceryList,
    };
    store.state = nextState;

    if (callback) {
      callback();
    }
  };

  return store;
}
