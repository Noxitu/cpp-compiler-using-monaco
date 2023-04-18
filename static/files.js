export const source_code = `#include <filesystem>
#include <opencv2/core.hpp>
#include <opencv2/imgcodecs.hpp>
#include <opencv2/imgproc.hpp>

int main()
{
    cv::Mat img = cv::Mat4b::zeros(40, 100);
    cv::circle(img, {20, 20}, 10, {255, 0, 0, 255}, -1);
    cv::circle(img, {50, 20}, 10, {0, 255, 0, 255}, -1);
    cv::circle(img, {80, 20}, 10, {0, 0, 255, 255}, -1);

    cv::imwrite("img.png", img);
}`

export const source_code3 = `#include <iostream>

int main() {
        constexpr int myVariableName = 42;
        printf("myVariableName = %d\\n", my_variable_name);
        // printf("myVariableName = %d\\n", myVariableName);
        // std::cout << "myVariableName = " << myVariableName << std::endl;
        return 0;
}
`

export const source_code2 = `#include <iostream>
#include <gtest/gtest.h>

const auto text = R"!(
    Multi-line string!!
    ";   // yes
    )";  // yes2
)!";     // yes3

int foo(const int& x, 
        const int &y){
    return 3;
}

int function()
{
    register int a;
    std::cout << "Hello World" << std::endl;
    std::cout << R"(I like "editors")" << std::endl;
    return 5 + 6;
}

TEST(Group1, Test1) { int my_variable_value = 5; ASSERT_EQ(my_variable_value, 5); }
TEST(Group1, Test2) { ASSERT_TRUE(true); ASSERT_TRUE(false) << "I have failed."; }
TEST(Group2, Test1) { std::cout << "Normal cout" << std::endl; ASSERT_TRUE(true); }
`

window.use_source_code2 = () => editor.setValue(source_code2)

export const dot_clang_format = `
---
# We'll use defaults from the LLVM style, but with 4 columns indentation.
BasedOnStyle: LLVM
IndentWidth: 4
---
Language: Cpp
# Force pointers to the type for C++.
DerivePointerAlignment: false
PointerAlignment: Left
InsertBraces: true
BreakBeforeBraces: Allman
SeparateDefinitionBlocks: Always
ColumnLimit: 120
NamespaceIndentation: All
FixNamespaceComments: true
---
`