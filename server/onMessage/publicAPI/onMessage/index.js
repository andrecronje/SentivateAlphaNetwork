module.exports = async (state) => {
  const {
    cnsl,
    logImprt,
    send,
    error: logError,
    success,
    public: {
      api
    },
    utility: {
      stringify,
      hasValue
    }
  } = state;
  logImprt('ON PUBLIC MESSAGE', __dirname);
  const onMessage = async (stream, json) => {
    const methodName = json.api;
    if (!methodName) {
      return logError(`Invalid no method name given. ${stringify(json)}`);
    }
    const method = api[methodName];
    if (method) {
      const body = json.body;
      if (body) {
        const rid = json.rid;
        if (hasValue(rid)) {
          cnsl(`Request:${json.api} RequestID: ${rid}`, json.body);
          const responseBody = await method(stream, body, json);
          if (responseBody) {
            stream.send({
              rid,
              body: responseBody
            });
          }
        } else {
          const eid = json.eid;
          if (hasValue(eid)) {
            success(`Request:${method} Emit ID:${eid} ${stringify(json)}`);
            method(stream, body, json);
          } else {
            return logError(`Invalid Request type. No Emit ID or Request ID was given. ${stringify(json)}`);
          }
        }
      } else {
        return logError(`Invalid Request no body was sent. ${stringify(json)}`);
      }
    } else {
      return logError(`Invalid method name given. ${stringify(json)}`);
    }
  };
  state.public.onMessage = onMessage;
};
