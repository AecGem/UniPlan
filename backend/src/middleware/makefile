#Oh my god, it's a makefile!

#Defining variables
BuildName = verifier		#Build name
BuildPath = ../build		#Build path
CC = g++					#Compiler

#Main object files
Algorithm.o: Algorithm.cpp json.hpp
	$(CC) -c Algorithm.cpp

json.o: json.hpp
	$(CC) -c json.hpp

#Main target and linking
$(BuildName): Algorithm.o json.o
	$(CC) Algorithm.o json.o -o $(BuildPath)/$(BuildName)

#Cleaning
clean:
	rm -f *.o $(BuildPath)/$(BuildName)

#Valgrind
valgrind:
	valgrind --leak-check=full $(BuildPath)/$(BuildName)

#Debug
debug:
	gdb $(BuildPath)/$(BuildName)