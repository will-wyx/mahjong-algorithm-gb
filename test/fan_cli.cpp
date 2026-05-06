#include "fan_calculator.h"
#include "stringify.h"
#include <iostream>
#include <string>
using namespace mahjong;

int main(int argc, char **argv) {
  if (argc < 5) return 2;
  calculate_param_t p{};
  std::string hand = argv[1];
  p.win_flag = static_cast<win_flag_t>(std::stoi(argv[2]));
  p.prevalent_wind = static_cast<wind_t>(std::stoi(argv[3]));
  p.seat_wind = static_cast<wind_t>(std::stoi(argv[4]));
  p.flower_count = (argc > 5) ? std::stoi(argv[5]) : 0;

  if (string_to_tiles(hand.c_str(), hand.size(), &p.hand_tiles, &p.win_tile) != PARSE_NO_ERROR) return 1;

  fan_table_t table{};
  int total = calculate_fan(&p, &table);
  std::cout << total;

  bool detail = argc > 6 && std::string(argv[6]) == "--detail";
  if (detail) {
    std::cout << "|";
    bool first = true;
    for (int i = 1; i < FAN_TABLE_SIZE; ++i) {
      if (table[i] == 0) continue;
      if (!first) std::cout << ",";
      first = false;
      std::cout << i << ":" << table[i];
    }
  }
  return 0;
}
