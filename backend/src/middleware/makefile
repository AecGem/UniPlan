#Oh my god, it's a makefile!

#Defining variables
BuildName = verifier		#Build name
CC = g++					#Compiler

#Build all
all: $(BuildName)

#Main object files
Algorithm.o: Algorithm.cpp json.hpp
	$(CC) -c Algorithm.cpp

#Main target and linking
$(BuildName): Algorithm.o
	$(CC) Algorithm.o -o $(BuildName) -lpthread

#Cleaning
clean:
	rm -f *.o $(BuildName)

#Valgrind
valgrind:
	valgrind --leak-check=full ./$(BuildName)

#Debug
debug:
	gdb ./$(BuildName)