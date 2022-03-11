import React, { useEffect, useState } from 'react';
import fetchMock from 'fetch-mock';
import ErrorItems from '../data/items.json';
import ErrorMessages from '../data/error-messages.json';

const errorResponse = { response: ErrorItems };

fetchMock.get(
  /\/checks/,
  {
    status: 200,
    body: JSON.stringify(errorResponse),
    statusText: 'OK',
    headers: {
      Accept: 'application/json',
      'Content-Type': 'application/json',
    },
    sendAsJson: false,
  },
  { overwriteRoutes: true }
);

export default function CheckErrors() {
  const [errors, setErrors] = useState([]);
  const [resp, setResponse] = useState('');

  useEffect(() => {
    window
      .fetch('/checks')
      .then((response) => response.json())
      .then((json) => {
        const flow = JSON.parse(json.body);
        console.log('flow: ', flow);
        setResponse(flow);
      });
  }, []);

  useEffect(() => {
    console.log('RESPONSe: ', resp);
    const errors = resp
      ? resp.response.autoCorrectedItems.reduce((prev, next) => {
          const errorCode = [next.errors[0]];
          const prevItems = prev[errorCode] ? prev[errorCode].items : [];
          return {
            ...prev,
            [errorCode]: {
              items: [...prevItems, next],
            },
          };
        }, {})
      : {};

    const formattedErrors = Object.keys(errors).map((err) => ({
      errorCode: err,
      errorMessage: (
        ErrorMessages.errors.find((e) => e.errorCode === err) || {}
      ).displayMessage.replace('{totalCount}', errors[err].items.length),
      ...errors[err],
    }));

    console.log('ERRORS: ', formattedErrors);

    setErrors(formattedErrors);
  }, [resp]);

  return (
    <div>
      {errors.map((error, index) => (
        <div key={`error-${index}`}>
          <p>{error.errorMessage}</p>
          <ul>
            {error.items.map((item, index) => (
              <li key={`error-item-${index}`}>{item.productInfo.name}</li>
            ))}
          </ul>
        </div>
      ))}
    </div>
  );
}
