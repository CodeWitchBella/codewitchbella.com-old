#include "stepper.h"

#include <iostream> // cout
#include <iterator> // back_inserter
#include <limits>
#include <sstream>
#include <vector>

template <typename T, typename ORIENT, typename EXTENDED>
struct Kernel final {
  typedef T FloatType;
  typedef ORIENT Orient;
  typedef EXTENDED Extended;
};

template <typename T>
struct Point {
  T x, y;
  Point(const T &x, const T &y)
      : x(x)
      , y(y) { }

  bool operator<(const Point<T> &p) const { return x < p.x || (x == p.x && y < p.y); };
  bool operator==(const Point<T> &p) const { return (x == p.x && y == p.y); }
  bool operator!=(const Point<T> &p) const { return (x != p.x || y != p.y); }

  Point<T> operator+(const Point<T> &p) {
    return (Point<T>(this->x + p.x, this->y + p.y));
  }
};

enum OrientationType {
  ORIENTATION_UNDEF = std::numeric_limits<int>::max(),
  RIGHT_TURN = -1,
  STRAIGHT = 0,
  LEFT_TURN = 1
};

void to_json(nlohmann::json &j, const Point<float> &p) {
  j = nlohmann::json { { "x", p.x }, { "y", p.y } };
}

/**
 * might modify both output_data AND input
 */
template <class KERNEL>
void grahamHull(ExportedData &output_data, std::vector<Point<typename KERNEL::FloatType>> &input) {
  typedef typename KERNEL::FloatType FloatType;
  typename KERNEL::Orient orient;

  if (input.size() == 0)
    return;

  // legicographic sort
  std::sort(input.begin(), input.end());

  std::vector<Point<FloatType>> hull;

  auto out = [&]() {
    output_data["hull"] = hull;
    output_data["candidate"] = 0;
  };
  auto step = [&](const Point<FloatType> &candidate) {
    out();
    output_data["candidate"] = candidate;
    algorithm_step(output_data);
  };

  for (const auto &element : input) {
    while (true) {
      bool pred = hull.size() >= 2 && orient(hull[hull.size() - 2], hull[hull.size() - 1], element) <= 0;
      step(element);
      if (!pred)
        break;
      hull.pop_back();
    };
    hull.emplace_back(element);
  }

  int t = hull.size() + 1;
  // reverse order iteration
  for (auto it = input.rbegin(); it != input.rend(); ++it) {
    auto element = *it;
    while (true) {
      bool pred = hull.size() >= t && orient(hull[hull.size() - 2], hull[hull.size() - 1], element) <= 0;
      step(element);
      if (!pred)
        break;
      hull.pop_back();
    };
    hull.emplace_back(element);
  }

  hull.pop_back(); // prevent doubling of first point
  out();
}

template <class KERNEL>
void work() {
  ExportedData output_data;
  output_data["henlo"] = "yeet";
  std::vector<Point<typename KERNEL::FloatType>> points;
  nlohmann::json input_data;
  {
    std::unique_ptr<char, decltype(&free)> data(algorithm_get_data(), free);
    input_data = nlohmann::json::parse(data.get());
  }

  std::cout << input_data["points"].dump() << "\n";

  for (const auto &o : input_data["points"]) {
    points.emplace_back(o["x"], o["y"]);
    std::cout << points.back().x << " " << points.back().y << "\n";
  }

  grahamHull<KERNEL>(output_data, points);
  algorithm_done(output_data);
}

template <typename T>
struct Orient2dNaive2 {
  OrientationType operator()(Point<T> a, Point<T> b, Point<T> c) {
    T result = (a.x - c.x) * (b.y - c.y) - (a.y - c.y) * (b.x - c.x); //PIVOT c

    if (result > (T)0)
      return LEFT_TURN;
    else if (result < (T)0)
      return RIGHT_TURN;
    else
      return STRAIGHT;
  }
};

template <class T>
struct Extended2dNaive final {
  bool operator()(Point<T> p, Point<T> q, Point<T> r) {
    return ((q.x - p.x) * (r.x - q.x) >= (p.y - q.y) * (r.y - q.y));
  }
};

typedef Kernel<float, Orient2dNaive2<float>, Extended2dNaive<float>> KernelFloatInexact;
typedef Kernel<double, Orient2dNaive2<double>, Extended2dNaive<double>> KernelDoubleInexact;
//typedef Kernel<REAL, Orient2dAdaptive<REAL>, Extended2dExact<REAL>> KernelDoubleAdaptiveShewchuk;

EXPORT void work_float_inexact() {
  work<KernelFloatInexact>();
}
