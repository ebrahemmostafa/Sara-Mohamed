(function () {
  var STORE_URL = 'https://mantledb.sh/v2/mohamed-sara-rsvp-019e7a36/responses';
  var STORE_KEY = 'dfd84d7d77942f6ba284b2d933957fbe98d93c6386f1a986653d36e2799eb822';

  function normalizeData(data) {
    if (!data || typeof data !== 'object') {
      return createEmptyData();
    }

    if (!data.responses || typeof data.responses !== 'object') {
      data.responses = {};
    }

    if (!data.event) {
      data.event = 'Mohamed & Sara Wedding RSVP';
    }

    return data;
  }

  function createEmptyData() {
    return {
      event: 'Mohamed & Sara Wedding RSVP',
      responses: {}
    };
  }

  function normalizeResponses(responses) {
    if (Array.isArray(responses)) {
      return responses;
    }

    if (!responses || typeof responses !== 'object') {
      return [];
    }

    return Object.keys(responses).map(function (id) {
      return Object.assign({ id: id }, responses[id]);
    });
  }

  function createId() {
    return Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);
  }

  function requestError(response) {
    return new Error('RSVP store request failed with status ' + response.status);
  }

  async function readData() {
    var response = await fetch(STORE_URL + '?cacheBust=' + Date.now(), {
      method: 'GET',
      headers: {
        Accept: 'application/json',
        'X-Mantle-Key': STORE_KEY
      },
      cache: 'no-store'
    });

    if (!response.ok) {
      throw requestError(response);
    }

    return normalizeData(await response.json());
  }

  async function writeData(data) {
    var nextData = normalizeData(data);
    nextData.updatedAt = new Date().toISOString();

    var response = await fetch(STORE_URL, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Mantle-Key': STORE_KEY
      },
      body: JSON.stringify(nextData)
    });

    if (!response.ok) {
      throw requestError(response);
    }

    return nextData;
  }

  async function patchData(patch) {
    var response = await fetch(STORE_URL, {
      method: 'PATCH',
      headers: {
        Accept: 'application/json',
        'Content-Type': 'application/json',
        'X-Mantle-Key': STORE_KEY
      },
      body: JSON.stringify(patch)
    });

    if (!response.ok) {
      throw requestError(response);
    }

    return response.json();
  }

  async function listResponses() {
    var data = await readData();
    return normalizeResponses(data.responses);
  }

  async function addResponse(response) {
    var id = createId();
    var nextResponse = Object.assign({
      id: id,
      submittedAt: new Date().toISOString()
    }, response);
    var patch = {
      responses: {},
      updatedAt: new Date().toISOString()
    };

    patch.responses[id] = nextResponse;
    await patchData(patch);
    return nextResponse;
  }

  async function clearResponses() {
    return writeData(createEmptyData());
  }

  window.RsvpStore = {
    add: addResponse,
    clear: clearResponses,
    list: listResponses,
    url: STORE_URL
  };
})();
