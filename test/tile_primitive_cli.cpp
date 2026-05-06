#include "tile.h"
#include <iostream>
using namespace mahjong;

int main(int argc, char **argv) {
  if (argc < 2) return 2;
  int v = std::stoi(argv[1], nullptr, 0);
  tile_t t = static_cast<tile_t>(v);
  std::cout << static_cast<int>(tile_get_suit(t)) << ","
            << static_cast<int>(tile_get_rank(t)) << ","
            << (is_numbered_suit(t) ? 1 : 0) << ","
            << (is_terminal(t) ? 1 : 0) << ","
            << (is_honor(t) ? 1 : 0) << ","
            << (is_winds(t) ? 1 : 0) << ","
            << (is_terminal_or_honor(t) ? 1 : 0);
  return 0;
}
