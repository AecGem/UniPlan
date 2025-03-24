#Oh my god, it's a makefile!

#Defining variables
BuildName = verifier		#Build name
CC = g++					#Compiler

#Build all
all: $(BuildName)

#Main object files
Algorithm.o: Algorithm.cpp json.hpp
	$(CC) -c Algorithm.cpp

json.o: json.hpp
	$(CC) -o json.hpp

#Main target and linking
$(BuildName): Algorithm.o json.o
	$(CC) Algorithm.o json.o -o $(BuildName)

#Cleaning
clean:
	rm -f *.o $(BuildName)

#Valgrind
valgrind:
	valgrind --leak-check=full $(BuildName)

#Debug
debug:
	gdb $(BuildName)