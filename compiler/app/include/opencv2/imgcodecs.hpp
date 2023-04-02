#pragma once
#include <fstream>
#include <filesystem>
#include </home/compiler/.conan/data/opencv/4.5.5/_/_/package/e22db7dfa4570fdbce29a80d4087d8a0cf2a8ae9/include/opencv4/opencv2/imgcodecs.hpp>

const cv::String &instrument_imwrite(const cv::String &path, 
                                     const char *filename, 
                                     const int line) 
{
    if (std::string(filename) == "source.cpp")
    {
        static std::ofstream out("./instrumented_imwrite.txt");
        out << line << '\n'
            << path << '\n'
            << std::filesystem::absolute(path).u8string() << '\n'
            << std::flush;
    }
    return path;
}

#define imwrite(path, ...) imwrite(instrument_imwrite(path, __FILE__, __LINE__), __VA_ARGS__)
