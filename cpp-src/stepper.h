#include "vendor/json.hpp"

#ifdef __EMSCRIPTEN__
#include <emscripten.h>
#define EXPORT extern "C" EMSCRIPTEN_KEEPALIVE

// clang-format off
EM_JS(char*, algorithm_get_data, (), {
  const jsString = Module['input_data'];
  Module['input_data'] = null;
  const lengthBytes = lengthBytesUTF8(jsString) + 1;
  const stringOnWasmHeap = _malloc(lengthBytes);
  stringToUTF8(jsString, stringOnWasmHeap, lengthBytes);
  return stringOnWasmHeap;
});
EM_JS(void, algorithm_step, (const char *data), {
  Module['step_data'] = JSON.parse(UTF8ToString(data));
  Asyncify.handleAsync(() => {
    if (Module['step_finished']) Module['step_finished'](false);
    return new Promise((resolve) => {
      Module['resume'] = resolve
    })
  });
});
EM_JS(void, algorithm_done, (const char *data), {
  Module['step_data'] = JSON.parse(UTF8ToString(data));
  if (Module['step_finished']) Module['step_finished'](true);
});
// clang-format on

#else
#define EXPORT extern "C"
char *algorithm_get_data() {
  char *data = (char *)malloc(3);
  data[0] = '{';
  data[1] = '}';
  data[2] = 0;
  return data;
}
void algorithm_step(const char *data) { }
void algorithm_done(const char *data) { }
#endif

class ExportedData {
public:
  nlohmann::json json;

  nlohmann::json *operator->() {
    return &json;
  }

  nlohmann::json &operator[](const char *field) {
    return json.operator[](field);
  }

  std::string dump;
  operator const char *() {
    dump = json.dump();
    return dump.c_str();
  }
};
