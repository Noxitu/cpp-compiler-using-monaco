export const source_code = `#include <iostream>

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
---
`